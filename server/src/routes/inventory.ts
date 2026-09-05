import { Router } from 'express';
import { db } from '../db.js';
import { LinenItem, WarehouseItem } from '../types.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Get linen inventory
router.get('/linen', (req, res) => {
  const linen = db.get().linen;
  const lowStock = linen.filter(item => item.clean <= item.minThreshold);
  res.json({
    items: linen,
    lowStockCount: lowStock.length,
    lowStockItems: lowStock
  });
});

// Update linen stock (restock clean, return from laundry, etc.)
router.post('/linen/:id/adjust', (req, res) => {
  const { action, quantity } = req.body; // action: 'return_laundry', 'send_laundry', 'restock_new', 'write_off'
  const qty = Number(quantity);

  if (isNaN(qty) || qty <= 0) {
    return res.status(400).json({ error: 'Valid positive quantity required' });
  }

  let updated: LinenItem | null = null;
  db.update(data => {
    const item = data.linen.find(l => l.id === req.params.id);
    if (item) {
      if (action === 'return_laundry') {
        const move = Math.min(item.dirty + item.inTransit, qty);
        if (item.dirty >= move) {
          item.dirty -= move;
        } else {
          item.inTransit = Math.max(0, item.inTransit - (move - item.dirty));
          item.dirty = 0;
        }
        item.clean += move;
      } else if (action === 'send_laundry') {
        const move = Math.min(item.dirty, qty);
        item.dirty -= move;
        item.inTransit += move;
      } else if (action === 'restock_new') {
        item.total += qty;
        item.clean += qty;
      } else if (action === 'write_off') {
        item.total = Math.max(0, item.total - qty);
        item.clean = Math.max(0, item.clean - qty);
      }
      updated = item;

      data.activityLogs.unshift({
        id: `act-${Date.now()}`,
        action: 'LINEN',
        title: `Linen updated: ${item.name}`,
        details: `${action.replace('_', ' ')} (${qty} ${item.unit})`,
        timestamp: new Date().toISOString(),
        entityType: 'linen',
        entityId: item.id
      });
    }
  });

  if (!updated) return res.status(404).json({ error: 'Linen item not found' });
  res.json(updated);
});

// Get warehouse inventory
router.get('/warehouse', (req, res) => {
  const { category, search } = req.query;
  let items = db.get().warehouse;

  if (category && category !== 'all') {
    items = items.filter(w => w.category === category);
  }
  if (search) {
    const s = String(search).toLowerCase();
    items = items.filter(w => w.name.toLowerCase().includes(s) || w.location.toLowerCase().includes(s));
  }

  const lowStock = items.filter(i => i.quantity <= i.minThreshold);

  res.json({
    items,
    lowStockCount: lowStock.length,
    lowStockItems: lowStock
  });
});

// Add new warehouse item
router.post('/warehouse', (req, res) => {
  const { name, category = 'Amenities', quantity = 10, unit = 'pcs', minThreshold = 5, location = 'Shelf A-1', costPerUnit = 1 } = req.body;
  const newItem: WarehouseItem = {
    id: `wh-${uuidv4().substring(0, 8)}`,
    name,
    category,
    quantity: Number(quantity),
    unit,
    minThreshold: Number(minThreshold),
    location,
    costPerUnit: Number(costPerUnit)
  };

  db.update(data => {
    data.warehouse.push(newItem);
  });

  res.status(201).json(newItem);
});

// Adjust warehouse item quantity
router.post('/warehouse/:id/adjust', (req, res) => {
  const { delta, reason } = req.body;
  const numDelta = Number(delta);

  let updated: WarehouseItem | null = null;
  db.update(data => {
    const item = data.warehouse.find(w => w.id === req.params.id);
    if (item) {
      item.quantity = Math.max(0, item.quantity + numDelta);
      updated = item;

      data.activityLogs.unshift({
        id: `act-${Date.now()}`,
        action: 'WAREHOUSE',
        title: `Warehouse adjusted: ${item.name}`,
        details: `${numDelta > 0 ? '+' : ''}${numDelta} ${item.unit} (${reason || 'Stock count update'})`,
        timestamp: new Date().toISOString(),
        entityType: 'system'
      });
    }
  });

  if (!updated) return res.status(404).json({ error: 'Item not found' });
  res.json(updated);
});

export default router;
