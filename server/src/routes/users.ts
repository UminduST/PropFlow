import { Router } from 'express';
import { db } from '../db.js';
import { SystemUser } from '../types.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Get all system users
router.get('/', (req, res) => {
  res.json(db.get().users);
});

// Create new user
router.post('/', (req, res) => {
  const { name, email, role = 'cleaner', phone } = req.body;
  const initials = name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const newUser: SystemUser = {
  id: "...", // your generated id or logic
  name: req.body.name,
  username: req.body.username || req.body.email.split('@')[0], // Add this line
  email: req.body.email,
  role: req.body.role,
  avatar: req.body.avatar,
  phone: req.body.phone,
  active: true,
  telegramPin: "..."
};

  db.update(data => {
    data.users.push(newUser);
  });

  res.status(201).json(newUser);
});

// Update user
router.put('/:id', (req, res) => {
  let updated: SystemUser | null = null;
  db.update(data => {
    const idx = data.users.findIndex(u => u.id === req.params.id);
    if (idx !== -1) {
      updated = { ...data.users[idx], ...req.body };
      data.users[idx] = updated!;
    }
  });
  if (!updated) return res.status(404).json({ error: 'User not found' });
  res.json(updated);
});

// Toggle user active status
router.patch('/:id/status', (req, res) => {
  let updated: SystemUser | null = null;
  db.update(data => {
    const user = data.users.find(u => u.id === req.params.id);
    if (user) {
      user.active = !user.active;
      updated = user;
    }
  });
  if (!updated) return res.status(404).json({ error: 'User not found' });
  res.json(updated);
});

export default router;
