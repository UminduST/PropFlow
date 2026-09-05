import { Router } from 'express';
import { db } from '../db.js';
import { Apartment, Zone } from '../types.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Get all apartments
router.get('/', (req, res) => {
  const { areaId, status, search } = req.query;
  let apartments = db.get().apartments;

  if (areaId && areaId !== 'all') {
    apartments = apartments.filter(a => a.areaId === areaId);
  }
  if (status && status !== 'all') {
    apartments = apartments.filter(a => a.status === status);
  }
  if (search) {
    const s = String(search).toLowerCase();
    apartments = apartments.filter(a =>
      a.name.toLowerCase().includes(s) ||
      a.areaName.toLowerCase().includes(s) ||
      a.address.toLowerCase().includes(s)
    );
  }

  res.json(apartments);
});

// Get single apartment
router.get('/:id', (req, res) => {
  const apartment = db.get().apartments.find(a => a.id === req.params.id);
  if (!apartment) return res.status(404).json({ error: 'Apartment not found' });
  res.json(apartment);
});

// Create apartment
router.post('/', (req, res) => {
  const {
    name,
    areaId,
    address,
    bedrooms = 1,
    bathrooms = 1,
    maxGuests = 2,
    keyLockboxCode = '0000',
    smartLockPin,
    wifiSsid,
    wifiPassword,
    ownerId,
    status = 'active',
    imageUrl,
    notes
  } = req.body;

  const zones = db.get().zones;
  const targetZone = zones.find(z => z.id === areaId) || zones[0];
  const owners = db.get().owners;
  const targetOwner = owners.find(o => o.id === ownerId);

  const newApartment: Apartment = {
    id: `apt-${uuidv4().substring(0, 8)}`,
    name,
    areaId: targetZone ? targetZone.id : 'zone-1',
    areaName: targetZone ? targetZone.name : 'General Area',
    address: address || 'No address provided',
    bedrooms: Number(bedrooms),
    bathrooms: Number(bathrooms),
    maxGuests: Number(maxGuests),
    keyLockboxCode,
    smartLockPin,
    wifiSsid,
    wifiPassword,
    ownerId: targetOwner ? targetOwner.id : (owners[0]?.id || 'owner-1'),
    ownerName: targetOwner ? targetOwner.name : (owners[0]?.name || 'Unassigned'),
    status: status || 'active',
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80',
    notes
  };

  db.update(data => {
    data.apartments.push(newApartment);
    // Update zone count
    const z = data.zones.find(zone => zone.id === newApartment.areaId);
    if (z) z.apartmentCount = (z.apartmentCount || 0) + 1;
    // Update owner association
    const o = data.owners.find(owner => owner.id === newApartment.ownerId);
    if (o && !o.apartmentIds.includes(newApartment.id)) {
      o.apartmentIds.push(newApartment.id);
    }
    // Log activity
    data.activityLogs.unshift({
      id: `act-${Date.now()}`,
      action: 'CREATE',
      title: 'New apartment added',
      details: `${newApartment.name} in ${newApartment.areaName}`,
      timestamp: new Date().toISOString(),
      entityType: 'system',
      entityId: newApartment.id
    });
  });

  res.status(201).json(newApartment);
});

// Update apartment
router.put('/:id', (req, res) => {
  let updated: Apartment | null = null;
  db.update(data => {
    const idx = data.apartments.findIndex(a => a.id === req.params.id);
    if (idx !== -1) {
      const existing = data.apartments[idx];
      const area = data.zones.find(z => z.id === (req.body.areaId || existing.areaId));
      const owner = data.owners.find(o => o.id === (req.body.ownerId || existing.ownerId));

      updated = {
        ...existing,
        ...req.body,
        areaName: area ? area.name : existing.areaName,
        ownerName: owner ? owner.name : existing.ownerName
      };
      data.apartments[idx] = updated!;
    }
  });

  if (!updated) return res.status(404).json({ error: 'Apartment not found' });
  res.json(updated);
});

// Delete apartment
router.delete('/:id', (req, res) => {
  db.update(data => {
    data.apartments = data.apartments.filter(a => a.id !== req.params.id);
  });
  res.json({ success: true });
});

// Zones endpoints
router.get('/zones/all', (req, res) => {
  const zones = db.get().zones.map(zone => ({
    ...zone,
    apartmentCount: db.get().apartments.filter(a => a.areaId === zone.id).length
  }));
  res.json(zones);
});

router.post('/zones', (req, res) => {
  const { name, description } = req.body;
  const newZone: Zone = {
    id: `zone-${Date.now()}`,
    name,
    description,
    apartmentCount: 0
  };
  db.update(data => {
    data.zones.push(newZone);
  });
  res.status(201).json(newZone);
});

export default router;
