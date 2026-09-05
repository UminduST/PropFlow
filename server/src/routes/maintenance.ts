import { Router } from 'express';
import { db } from '../db.js';
import { MaintenanceTask, MaintenancePhoto } from '../types.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Get all maintenance tasks
router.get('/', (req, res) => {
  const { apartmentId, status, priority, category, search } = req.query;
  let tasks = db.get().maintenance;

  if (apartmentId && apartmentId !== 'all') {
    tasks = tasks.filter(t => t.apartmentId === apartmentId);
  }
  if (status && status !== 'all') {
    tasks = tasks.filter(t => t.status === status);
  }
  if (priority && priority !== 'all') {
    tasks = tasks.filter(t => t.priority === priority);
  }
  if (category && category !== 'all') {
    tasks = tasks.filter(t => t.category === category);
  }
  if (search) {
    const s = String(search).toLowerCase();
    tasks = tasks.filter(t =>
      t.title.toLowerCase().includes(s) ||
      t.apartmentName.toLowerCase().includes(s) ||
      t.description.toLowerCase().includes(s)
    );
  }

  res.json(tasks);
});

// Create maintenance ticket
router.post('/', (req, res) => {
  const {
    apartmentId,
    title,
    description,
    category = 'General',
    priority = 'medium',
    assigneeId,
    estimatedBudget = 50,
    reportedBy = 'Staff',
    photoUrl
  } = req.body;

  const apt = db.get().apartments.find(a => a.id === apartmentId);
  if (!apt) return res.status(400).json({ error: 'Apartment not found' });

  const tech = db.get().users.find(u => u.id === assigneeId);

  const photos: MaintenancePhoto[] = [];
  if (photoUrl) {
    photos.push({
      id: `mp-${Date.now()}`,
      type: 'reported',
      url: photoUrl,
      timestamp: new Date().toISOString(),
      caption: 'Initial issue inspection'
    });
  }

  const newTask: MaintenanceTask = {
    id: `mnt-${uuidv4().substring(0, 8)}`,
    apartmentId: apt.id,
    apartmentName: apt.name,
    areaName: apt.areaName,
    title,
    description,
    category,
    priority,
    status: 'reported',
    estimatedBudget: Number(estimatedBudget),
    actualCost: 0,
    reportedBy,
    reportedAt: new Date().toISOString(),
    assigneeId: tech?.id,
    assigneeName: tech?.name,
    photos
  };

  db.update(data => {
    data.maintenance.push(newTask);

    // If urgent priority, push Telegram alert
    if (priority === 'urgent' || priority === 'high') {
      data.telegramMessages.push({
        id: `tg-${Date.now()}`,
        sender: 'bot',
        text: `🚨 *URGENT MAINTENANCE ALERT*\n🏠 Apartment: *${apt.name}*\n⚠️ Issue: *${title}*\nPriority: ${priority.toUpperCase()}\nReported by: ${reportedBy}`,
        timestamp: new Date().toISOString(),
        type: 'alert'
      });
    }

    data.activityLogs.unshift({
      id: `act-${Date.now()}`,
      action: 'MAINTENANCE',
      title: 'New maintenance issue reported',
      details: `${title} at ${apt.name} [${priority.toUpperCase()}]`,
      timestamp: new Date().toISOString(),
      entityType: 'maintenance',
      entityId: newTask.id
    });
  });

  res.status(201).json(newTask);
});

// Update maintenance task (status, budget, actual cost, notes)
router.put('/:id', (req, res) => {
  let updated: MaintenanceTask | null = null;
  db.update(data => {
    const idx = data.maintenance.findIndex(t => t.id === req.params.id);
    if (idx !== -1) {
      const existing = data.maintenance[idx];
      const assignee = data.users.find(u => u.id === (req.body.assigneeId || existing.assigneeId));

      const taskItem = {
        ...existing,
        ...req.body,
        assigneeName: assignee ? assignee.name : existing.assigneeName,
        resolvedAt: req.body.status === 'resolved' ? (existing.resolvedAt || new Date().toISOString()) : existing.resolvedAt
      };
      updated = taskItem;
      data.maintenance[idx] = taskItem;

      data.activityLogs.unshift({
        id: `act-${Date.now()}`,
        action: 'MAINTENANCE',
        title: `Maintenance updated: ${taskItem.status}`,
        details: `${taskItem.title} at ${taskItem.apartmentName}`,
        timestamp: new Date().toISOString(),
        entityType: 'maintenance',
        entityId: taskItem.id
      });
    }
  });

  if (!updated) return res.status(404).json({ error: 'Task not found' });
  res.json(updated);
});

// Add photo to maintenance
router.post('/:id/photos', (req, res) => {
  const { url, type = 'fixed', caption } = req.body;
  if (!url) return res.status(400).json({ error: 'Image URL required' });

  const photo: MaintenancePhoto = {
    id: `mp-${uuidv4().substring(0, 8)}`,
    type,
    url,
    timestamp: new Date().toISOString(),
    caption
  };

  let updated: MaintenanceTask | null = null;
  db.update(data => {
    const task = data.maintenance.find(t => t.id === req.params.id);
    if (task) {
      task.photos.push(photo);
      updated = task;
    }
  });

  if (!updated) return res.status(404).json({ error: 'Task not found' });
  res.json({ photo, task: updated });
});

export default router;
