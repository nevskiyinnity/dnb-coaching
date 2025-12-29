// User storage and utilities (Redis/Vercel KV for production, file-backed for local dev)

import Redis from 'ioredis';
import { Redis as UpstashRedis } from '@upstash/redis';
import { kv } from '@vercel/kv';
import fs from 'fs';
import path from 'path';

export interface User {
  id: string;
  name: string;
  code: string;
  expiryDate: string | null; // ISO string or null for no expiry
  createdAt: string;
}

// Key for storing all users
const USERS_KEY = 'users';

// Where to store data during local/dev usage. On Vercel prod, filesystem is read-only.
const DATA_DIR = path.resolve(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'users.json');

// Initialize standard Redis client (ioredis) for connection strings
let redisClient: Redis | null = null;
function getStandardRedisClient(): Redis | null {
  if (redisClient) return redisClient;

  // Check for standard Redis connection string (redis://...)
  const redisUrl = process.env.REDIS_URL;

  if (redisUrl && redisUrl.startsWith('redis://')) {
    try {
      redisClient = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        enableReadyCheck: false,
        lazyConnect: true,
        connectTimeout: 10000,
      });
      return redisClient;
    } catch (error) {
      console.error('Failed to initialize Redis:', error);
      return null;
    }
  }

  return null;
}

// Initialize Upstash Redis client (REST API) if credentials are available
let upstashClient: UpstashRedis | null = null;
function getUpstashClient(): UpstashRedis | null {
  if (upstashClient) return upstashClient;

  // Check for Upstash Redis REST API credentials
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (upstashUrl && upstashToken) {
    try {
      upstashClient = new UpstashRedis({
        url: upstashUrl,
        token: upstashToken,
      });
      return upstashClient;
    } catch (error) {
      console.error('Failed to initialize Upstash Redis:', error);
      return null;
    }
  }

  return null;
}

// Check which storage method is available (priority: Standard Redis > Upstash Redis > Vercel KV > File system)
function getStorageType(): 'redis' | 'upstash' | 'vercel-kv' | 'file' {
  if (getStandardRedisClient()) return 'redis';
  if (getUpstashClient()) return 'upstash';
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) return 'vercel-kv';
  console.log('Using file-based storage at:', DATA_FILE);
  return 'file';
}

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch { }
}

async function readAll(): Promise<User[]> {
  const storageType = getStorageType();

  if (storageType === 'redis') {
    try {
      const client = getStandardRedisClient();
      if (!client) return [];
      // ioredis with lazyConnect will auto-connect on first command
      const data = await client.get(USERS_KEY);
      if (!data) return [];
      const users = JSON.parse(data) as User[];
      return Array.isArray(users) ? users : [];
    } catch (error) {
      console.error('Redis read error:', error);
      return [];
    }
  } else if (storageType === 'upstash') {
    try {
      const client = getUpstashClient();
      if (!client) return [];
      const users = await client.get<User[]>(USERS_KEY);
      return Array.isArray(users) ? users : [];
    } catch (error) {
      console.error('Upstash Redis read error:', error);
      return [];
    }
  } else if (storageType === 'vercel-kv') {
    try {
      const users = await kv.get<User[]>(USERS_KEY);
      return Array.isArray(users) ? users : [];
    } catch (error) {
      console.error('Vercel KV read error:', error);
      return [];
    }
  } else {
    // Fallback to file system for local dev
    try {
      ensureDataDir();
      if (!fs.existsSync(DATA_FILE)) return [];
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as User[];
      return [];
    } catch (error) {
      console.error('File read error:', error);
      return [];
    }
  }
}

async function writeAll(users: User[]): Promise<void> {
  const storageType = getStorageType();

  if (storageType === 'redis') {
    try {
      const client = getStandardRedisClient();
      if (!client) throw new Error('Redis client not available');
      // ioredis with lazyConnect will auto-connect on first command
      await client.set(USERS_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('Redis write error:', error);
      throw error;
    }
  } else if (storageType === 'upstash') {
    try {
      const client = getUpstashClient();
      if (!client) throw new Error('Upstash Redis client not available');
      await client.set(USERS_KEY, users);
    } catch (error) {
      console.error('Upstash Redis write error:', error);
      throw error;
    }
  } else if (storageType === 'vercel-kv') {
    try {
      await kv.set(USERS_KEY, users);
    } catch (error) {
      console.error('Vercel KV write error:', error);
      throw error;
    }
  } else {
    // Fallback to file system for local dev
    try {
      ensureDataDir();
      fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2), 'utf8');
    } catch (error) {
      console.error('File write error:', error);
      // swallow in dev; callers will still return best-effort results
    }
  }
}

export async function getAllUsers(): Promise<User[]> {
  // Read fresh each call to keep both admin and chat in sync across functions
  return await readAll();
}

export async function getUserByCode(code: string): Promise<User | undefined> {
  const users = await getAllUsers();
  return users.find(u => u.code === code);
}

export async function addUser(user: User): Promise<void> {
  const users = await getAllUsers();
  users.push(user);
  await writeAll(users);
}

export async function updateUser(id: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<boolean> {
  const users = await getAllUsers();
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return false;
  users[index] = { ...users[index], ...updates };
  await writeAll(users);
  return true;
}

export async function deleteUser(id: string): Promise<boolean> {
  const users = await getAllUsers();
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return false;
  users.splice(index, 1);
  await writeAll(users);
  return true;
}

export async function isCodeValid(code: string): Promise<{ valid: boolean; user?: User; reason?: string }> {
  const clean = (code || '').trim().toUpperCase();
  if (!clean) return { valid: false, reason: 'Invalid code' };
  const user = await getUserByCode(clean);
  if (!user) return { valid: false, reason: 'Invalid code' };

  if (user.expiryDate) {
    const expiry = new Date(user.expiryDate);
    const now = new Date();
    if (now > expiry) {
      return { valid: false, user, reason: 'Code expired' };
    }
  }

  return { valid: true, user };
}

export function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed ambiguous chars
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
