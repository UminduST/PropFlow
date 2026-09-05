import { Router } from 'express';
import { db } from '../db.js';
import { Owner } from '../types.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Get all owners
router.get('/', (req, res) => {
  const { search } = req.query;
  let owners = db.get().owners;

  if (search) {
    const s = String(search).toLowerCase();
    owners = owners.filter(o =>
      o.name.toLowerCase().includes(s) ||
      o.email.toLowerCase().includes(s) ||
      o.phone.toLowerCase().includes(s)
    );
  }

  // Calculate live earnings based on apartment bookings
  const bookings = db.get().bookings;
  const apartments = db.get().apartments;

  const enrichedOwners = owners.map(owner => {
    const ownerApartments = apartments.filter(a => a.ownerId === owner.id);
    const aptIds = ownerApartments.map(a => a.id);
    const totalGross = bookings
      .filter(b => aptIds.includes(b.apartmentId) && b.status !== 'cancelled')
      .reduce((sum, b) => sum + b.payout, 0);

    const netEarnings = Math.round(totalGross * (1 - (owner.commissionRate / 100)));

    return {
      ...owner,
      apartmentIds: aptIds,
      apartmentsCount: aptIds.length,
      monthlyEarnings: netEarnings || owner.monthlyEarnings || 0
    };
  });

  res.json(enrichedOwners);
});

// Get single owner with detailed statement
router.get('/:id/statement', (req, res) => {
  const owner = db.get().owners.find(o => o.id === req.params.id);
  if (!owner) return res.status(404).json({ error: 'Owner not found' });

  const apartments = db.get().apartments.filter(a => a.ownerId === owner.id);
  const aptIds = apartments.map(a => a.id);
  const bookings = db.get().bookings.filter(b => aptIds.includes(b.apartmentId));
  const maintenance = db.get().maintenance.filter(m => aptIds.includes(m.apartmentId));

  const totalGross = bookings.reduce((sum, b) => sum + b.payout, 0);
  const commission = Math.round(totalGross * (owner.commissionRate / 100));
  const maintenanceExpenses = maintenance.reduce((sum, m) => sum + m.actualCost, 0);
  const netPayout = totalGross - commission - maintenanceExpenses;

  res.json({
    owner,
    apartments,
    bookings,
    maintenance,
    summary: {
      totalBookings: bookings.length,
      totalGross,
      commissionRate: owner.commissionRate,
      managementCommission: commission,
      maintenanceExpenses,
      netPayout
    }
  });
});

// Create owner
router.post('/', (req, res) => {
  const { name, email, phone, commissionRate = 15 } = req.body;
  const newOwner: Owner = {
    id: `owner-${uuidv4().substring(0, 8)}`,
    name,
    email,
    phone,
    apartmentIds: [],
    commissionRate: Number(commissionRate),
    monthlyEarnings: 0,
    status: 'active'
  };

  db.update(data => {
    data.owners.push(newOwner);
  });

  res.status(201).json(newOwner);
});

// Update owner
router.put('/:id', (req, res) => {
  let updated: Owner | null = null;
  db.update(data => {
    const idx = data.owners.findIndex(o => o.id === req.params.id);
    if (idx !== -1) {
      updated = { ...data.owners[idx], ...req.body };
      data.owners[idx] = updated!;
    }
  });
  if (!updated) return res.status(404).json({ error: 'Owner not found' });
  res.json(updated);
});

export default router;
