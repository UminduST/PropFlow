import { Router } from 'express';
import { db } from '../db.js';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'propflow_super_secret_jwt_key_2026';

// Login route
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username/email and password are required' });
  }

  const cleanUser = username.trim().toLowerCase();
  const users = db.get().users;

  // Find user by username or email
  const user = users.find(
    u => u.username.toLowerCase() === cleanUser || u.email.toLowerCase() === cleanUser
  );

  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  if (!user.active) {
    return res.status(403).json({ error: 'Account is disabled. Please contact your Super Administrator.' });
  }

  // Check password (matches demo password or custom)
  if (user.password && user.password !== password) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  // Generate JWT token
  const token = jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  // Return user without password
  const { password: _, ...safeUser } = user;

  res.json({
    success: true,
    token,
    user: safeUser,
    message: `Welcome back, ${user.name}!`
  });
});

// Get current logged-in user
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = db.get().users.find(u => u.id === decoded.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { password: _, ...safeUser } = user;
    res.json({ user: safeUser });
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

export default router;
