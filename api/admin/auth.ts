import type { VercelRequest, VercelResponse } from '@vercel/node';

const ADMIN_PASSWORD = 'DNBCoach';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { password } = req.body as { password?: string };

    if (password === ADMIN_PASSWORD) {
      return res.status(200).json({ success: true });
    }

    return res.status(401).json({ success: false, message: 'Invalid password' });
  } catch (e: unknown) {
    console.error('Admin auth error', e);
    return res.status(500).json({ message: 'Server error' });
  }
}
