import { Router } from 'express';
import { db } from '../db.js';
import { CleaningJob, CleaningPhoto } from '../types.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Get all cleaning jobs
router.get('/', (req, res) => {
  const { date, status, cleanerId, apartmentId, tomorrow } = req.query;
  let cleanings = db.get().cleanings;

  if (tomorrow === 'true') {
    // Tomorrow's date in local YYYY-MM-DD
    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrowStr = tomorrowDate.toISOString().split('T')[0];
    cleanings = cleanings.filter(c => c.scheduledDate === tomorrowStr || c.scheduledDate === '2026-08-29');
  } else if (date) {
    cleanings = cleanings.filter(c => c.scheduledDate === date);
  }

  if (status && status !== 'all') {
    cleanings = cleanings.filter(c => c.status === status);
  }
  if (cleanerId && cleanerId !== 'all') {
    cleanings = cleanings.filter(c => c.cleanerId === cleanerId);
  }
  if (apartmentId && apartmentId !== 'all') {
    cleanings = cleanings.filter(c => c.apartmentId === apartmentId);
  }

  res.json(cleanings);
});

// Dedicated route for "Cleaning tomorrow"
router.get('/tomorrow', (req, res) => {
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = tomorrowDate.toISOString().split('T')[0];

  const tomorrowCleanings = db.get().cleanings.filter(
    c => c.scheduledDate === tomorrowStr || c.scheduledDate === '2026-08-29'
  );

  res.json(tomorrowCleanings);
});

// Get single cleaning job
router.get('/:id', (req, res) => {
  const cleaning = db.get().cleanings.find(c => c.id === req.params.id);
  if (!cleaning) return res.status(404).json({ error: 'Cleaning job not found' });
  res.json(cleaning);
});

// Assign cleaner
router.post('/:id/assign', (req, res) => {
  const { cleanerId } = req.body;
  const user = db.get().users.find(u => u.id === cleanerId);

  let updated: CleaningJob | null = null;
  db.update(data => {
    const job = data.cleanings.find(c => c.id === req.params.id);
    if (job) {
      job.cleanerId = user ? user.id : undefined;
      job.cleanerName = user ? user.name : undefined;
      job.cleanerPhone = user ? user.phone : undefined;
      updated = job;

      // Add Telegram alert to the simulated Telegram queue
      if (user) {
        data.telegramMessages.push({
          id: `tg-${Date.now()}`,
          sender: 'bot',
          text: `📋 *New Turnover Assigned*\n🏠 Apartment: *${job.apartmentName}* (${job.areaName})\n🕒 Schedule: ${job.scheduledDate} ${job.timeWindow}\n🧹 Type: ${job.type.toUpperCase()}`,
          timestamp: new Date().toISOString(),
          type: 'task_assignment',
          buttons: [
            { text: '✅ Accept Task', callback_data: `accept_${job.id}` },
            { text: '📸 Upload Photo', callback_data: `upload_${job.id}` }
          ]
        });
      }

      data.activityLogs.unshift({
        id: `act-${Date.now()}`,
        action: 'CLEANING',
        title: 'Cleaner assigned',
        details: `${user?.name || 'Unassigned'} assigned to ${job.apartmentName}`,
        timestamp: new Date().toISOString(),
        entityType: 'cleaning',
        entityId: job.id
      });
    }
  });

  if (!updated) return res.status(404).json({ error: 'Job not found' });
  res.json(updated);
});

// Toggle checklist item
router.patch('/:id/checklist/:itemId', (req, res) => {
  const { completed } = req.body;
  let updatedJob: CleaningJob | null = null;

  db.update(data => {
    const job = data.cleanings.find(c => c.id === req.params.id);
    if (job) {
      const item = job.checklist.find(i => i.id === req.params.itemId);
      if (item) {
        item.completed = typeof completed === 'boolean' ? completed : !item.completed;
      }
      // If at least one item completed and status is scheduled, move to in_progress
      if (job.status === 'scheduled' && job.checklist.some(i => i.completed)) {
        job.status = 'in_progress';
        if (!job.startedAt) job.startedAt = new Date().toISOString();
      }
      updatedJob = job;
    }
  });

  if (!updatedJob) return res.status(404).json({ error: 'Job or item not found' });
  res.json(updatedJob);
});

// Update cleaning status (e.g. complete cleaning & deduct linen)
router.patch('/:id/status', (req, res) => {
  const { status, inspectedBy } = req.body;
  let updatedJob: CleaningJob | null = null;

  db.update(data => {
    const job = data.cleanings.find(c => c.id === req.params.id);
    if (job) {
      const prevStatus = job.status;
      job.status = status;

      if (status === 'in_progress' && !job.startedAt) {
        job.startedAt = new Date().toISOString();
      }

      if (status === 'completed') {
        job.completedAt = new Date().toISOString();
        // Mark all checklist items as completed
        job.checklist.forEach(i => (i.completed = true));

        // Deduct linen used if completing for the first time
        if (prevStatus !== 'completed' && job.linenUsed) {
          const lMap: Record<string, number> = {
            'Bath towels': job.linenUsed.bathTowels,
            'Hand towels': job.linenUsed.handTowels,
            'Bed sheets': job.linenUsed.bedSheets,
            'Pillowcases': job.linenUsed.pillowcases,
            'Duvet covers': job.linenUsed.duvetCovers
          };

          for (const [name, qty] of Object.entries(lMap)) {
            const item = data.linen.find(l => l.name === name);
            if (item && qty > 0) {
              item.clean = Math.max(0, item.clean - qty);
              item.dirty = item.dirty + qty;
            }
          }
        }
      }

      if (status === 'inspected') {
        job.inspectedBy = inspectedBy || 'Administrator';
      }

      updatedJob = job;

      data.activityLogs.unshift({
        id: `act-${Date.now()}`,
        action: 'CLEANING',
        title: `Cleaning ${status.toUpperCase()}`,
        details: `${job.apartmentName} marked as ${status}`,
        timestamp: new Date().toISOString(),
        entityType: 'cleaning',
        entityId: job.id
      });
    }
  });

  if (!updatedJob) return res.status(404).json({ error: 'Job not found' });
  res.json(updatedJob);
});

// Add photo to cleaning
router.post('/:id/photos', (req, res) => {
  const { type = 'after', url, room, caption } = req.body;
  if (!url) return res.status(400).json({ error: 'Image URL required' });

  const newPhoto: CleaningPhoto = {
    id: `photo-${uuidv4().substring(0, 8)}`,
    type,
    url,
    timestamp: new Date().toISOString(),
    room,
    caption
  };

  let updatedJob: CleaningJob | null = null;
  db.update(data => {
    const job = data.cleanings.find(c => c.id === req.params.id);
    if (job) {
      job.photos.push(newPhoto);
      updatedJob = job;

      data.activityLogs.unshift({
        id: `act-${Date.now()}`,
        action: 'PHOTO',
        title: 'Cleaning photo uploaded',
        details: `${type.toUpperCase()} photo added for ${job.apartmentName}`,
        timestamp: new Date().toISOString(),
        entityType: 'cleaning',
        entityId: job.id
      });
    }
  });

  if (!updatedJob) return res.status(404).json({ error: 'Job not found' });
  res.json({ photo: newPhoto, job: updatedJob });
});

// Create manual cleaning task
router.post('/', (req, res) => {
  const {
    apartmentId,
    scheduledDate,
    timeWindow = '10:00 - 13:00',
    type = 'turnover',
    cleanerId,
    notes,
    linenUsed
  } = req.body;

  const apt = db.get().apartments.find(a => a.id === apartmentId);
  if (!apt) return res.status(400).json({ error: 'Apartment not found' });

  const cleaner = db.get().users.find(u => u.id === cleanerId);

  const newJob: CleaningJob = {
    id: `cln-${uuidv4().substring(0, 8)}`,
    apartmentId: apt.id,
    apartmentName: apt.name,
    areaName: apt.areaName,
    scheduledDate,
    timeWindow,
    type,
    status: 'scheduled',
    cleanerId: cleaner?.id,
    cleanerName: cleaner?.name,
    cleanerPhone: cleaner?.phone,
    notes,
    checklist: [
      { id: `c-${Date.now()}-1`, room: 'Bedroom', task: 'Change bed sheets and pillowcases', completed: false },
      { id: `c-${Date.now()}-2`, room: 'Bathroom', task: 'Disinfect bathroom surfaces & restock towels', completed: false },
      { id: `c-${Date.now()}-3`, room: 'Kitchen', task: 'Clean kitchen countertops and empty trash', completed: false },
      { id: `c-${Date.now()}-4`, room: 'Living Room', task: 'Vacuum and mop floors', completed: false }
    ],
    photos: [],
    linenUsed: linenUsed || {
      bathTowels: apt.bedrooms * 2,
      handTowels: apt.bedrooms * 2,
      bedSheets: apt.bedrooms,
      pillowcases: apt.bedrooms * 2,
      duvetCovers: apt.bedrooms
    }
  };

  db.update(data => {
    data.cleanings.push(newJob);
  });

  res.status(201).json(newJob);
});

export default router;
