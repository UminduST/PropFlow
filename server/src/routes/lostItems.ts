import { Router } from 'express';
import { db } from '../db.js';
import { LostItem } from '../types.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Get all lost items
router.get('/', (req, res) => {
  const { status, apartmentId, search } = req.query;
  let items = db.get().lostItems;

  if (status && status !== 'all') {
    items = items.filter(i => i.status === status);
  }
  if (apartmentId && apartmentId !== 'all') {
    items = items.filter(i => i.apartmentId === apartmentId);
  }
  if (search) {
    const s = String(search).toLowerCase();
    items = items.filter(i =>
      i.itemName.toLowerCase().includes(s) ||
      i.apartmentName.toLowerCase().includes(s) ||
      i.description.toLowerCase().includes(s) ||
      (i.guestName && i.guestName.toLowerCase().includes(s))
    );
  }

  res.json(items);
});

// Report lost item
router.post('/', (req, res) => {
  const {
    apartmentId,
    itemName,
    category = 'Other',
    description,
    foundBy = 'Staff Cleaner',
    guestName,
    storageLocation = 'Operations Safe Box',
    photoUrl,
    notes
  } = req.body;

  const apt = db.get().apartments.find(a => a.id === apartmentId);
  if (!apt) return res.status(400).json({ error: 'Apartment not found' });

  const newItem: LostItem = {
    id: `lost-${uuidv4().substring(0, 8)}`,
    apartmentId: apt.id,
    apartmentName: apt.name,
    itemName,
    category,
    description: description || 'Item found during turnover cleaning',
    foundDate: new Date().toISOString().split('T')[0],
    foundBy,
    guestName,
    storageLocation,
    photoUrl: photoUrl || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80',
    status: 'reported',
    notes
  };

  db.update(data => {
    data.lostItems.unshift(newItem);

    // Push alert to Telegram
    data.telegramMessages.push({
      id: `tg-${Date.now()}`,
      sender: 'bot',
      text: `📦 *LOST ITEM REPORTED*\n🏠 Apartment: *${apt.name}*\n🏷️ Item: *${itemName}* (${category})\n👤 Finder: ${foundBy}\n📍 Storage: ${storageLocation}`,
      timestamp: new Date().toISOString(),
      type: 'alert'
    });

    data.activityLogs.unshift({
      id: `act-${Date.now()}`,
      action: 'LOST_ITEM',
      title: 'Lost item recorded',
      details: `${itemName} at ${apt.name}`,
      timestamp: new Date().toISOString(),
      entityType: 'lost_item',
      entityId: newItem.id
    });
  });

  res.status(201).json(newItem);
});

// Update lost item status
router.put('/:id', (req, res) => {
  let updated: LostItem | null = null;
  db.update(data => {
    const idx = data.lostItems.findIndex(i => i.id === req.params.id);
    if (idx !== -1) {
      const item = { ...data.lostItems[idx], ...req.body };
      updated = item;
      data.lostItems[idx] = item;

      data.activityLogs.unshift({
        id: `act-${Date.now()}`,
        action: 'LOST_ITEM',
        title: `Lost item status: ${item.status}`,
        details: `${item.itemName} (${item.status.replace('_', ' ')})`,
        timestamp: new Date().toISOString(),
        entityType: 'lost_item',
        entityId: item.id
      });
    }
  });

  if (!updated) return res.status(404).json({ error: 'Item not found' });
  res.json(updated);
});

export default router;
