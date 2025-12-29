import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAllUsers, addUser, updateUser, deleteUser, generateCode, type User } from '../lib/users.js';

const ADMIN_PASSWORD = 'DNBCoach';

function checkAuth(req: VercelRequest): boolean {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return false;
  
  // Simple bearer token check where token is the password
  const token = authHeader.replace('Bearer ', '');
  return token === ADMIN_PASSWORD;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!checkAuth(req)) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // GET - list all users
    if (req.method === 'GET') {
      const users = await getAllUsers();
      return res.status(200).json({ users });
    }

    // POST - create user
    if (req.method === 'POST') {
      const { name, expiryDate } = req.body as { name?: string; expiryDate?: string | null };
      
      if (!name || !name.trim()) {
        return res.status(400).json({ message: 'Name is required' });
      }

      const code = generateCode();
      const newUser: User = {
        id: Math.random().toString(36).slice(2) + Date.now().toString(36),
        name: name.trim(),
        code,
        expiryDate: expiryDate || null,
        createdAt: new Date().toISOString(),
      };

      await addUser(newUser);
      return res.status(201).json({ user: newUser });
    }

    // PUT - update user
    if (req.method === 'PUT') {
      const { id, name, expiryDate } = req.body as { id?: string; name?: string; expiryDate?: string | null };
      
      if (!id) {
        return res.status(400).json({ message: 'User ID is required' });
      }

      const updates: Partial<Omit<User, 'id' | 'createdAt'>> = {};
      if (name !== undefined) updates.name = name.trim();
      if (expiryDate !== undefined) updates.expiryDate = expiryDate;

      const success = await updateUser(id, updates);
      if (!success) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.status(200).json({ success: true });
    }

    // DELETE - delete user
    if (req.method === 'DELETE') {
      const { id } = req.body as { id?: string };
      
      if (!id) {
        return res.status(400).json({ message: 'User ID is required' });
      }

      const success = await deleteUser(id);
      if (!success) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (e: unknown) {
    console.error('Admin users API error', e);
    const errMsg = e instanceof Error ? e.message : 'Server error';
    return res.status(500).json({ message: errMsg });
  }
}
