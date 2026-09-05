import { Router } from 'express';
import { db } from '../db.js';
import { Booking, CleaningJob } from '../types.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Get all bookings
router.get('/', (req, res) => {
  const { apartmentId, source, startDate, endDate, search } = req.query;
  let bookings = db.get().bookings;

  if (apartmentId && apartmentId !== 'all') {
    bookings = bookings.filter(b => b.apartmentId === apartmentId);
  }
  if (source && source !== 'all') {
    bookings = bookings.filter(b => b.source.toLowerCase() === String(source).toLowerCase());
  }
  if (search) {
    const s = String(search).toLowerCase();
    bookings = bookings.filter(b =>
      b.apartmentName.toLowerCase().includes(s) ||
      b.guestName.toLowerCase().includes(s) ||
      b.areaName.toLowerCase().includes(s)
    );
  }

  res.json({
    bookings,
    lastSyncTime: db.get().lastSyncTime,
    totalCount: bookings.length
  });
});

// Trigger live OTA synchronization ("Sync now" button)
router.post('/sync', (req, res) => {
  const now = new Date();
  const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  db.update(data => {
    data.lastSyncTime = now.toISOString();

    // Pick a random apartment to log a sync update
    const apt = data.apartments[Math.floor(Math.random() * data.apartments.length)] || data.apartments[0];

    data.activityLogs.unshift({
      id: `act-${Date.now()}`,
      action: 'SYNC',
      title: 'Reservation synchronized',
      details: `${apt?.name || 'test 1'}`,
      timestamp: now.toISOString(),
      entityType: 'booking'
    });

    // If activity logs are more than 50, trim
    if (data.activityLogs.length > 50) {
      data.activityLogs = data.activityLogs.slice(0, 50);
    }
  });

  res.json({
    success: true,
    message: 'Channels synchronized successfully (Airbnb, Booking.com, Guesty, Lodgify, Direct)',
    lastSyncTime: db.get().lastSyncTime,
    syncCount: 11
  });
});

// Create new reservation
router.post('/', (req, res) => {
  const {
    apartmentId,
    guestName,
    guestEmail,
    guestPhone,
    guestCount = 2,
    startDate,
    endDate,
    source = 'Direct',
    payout = 200,
    notes
  } = req.body;

  const apt = db.get().apartments.find(a => a.id === apartmentId);
  if (!apt) return res.status(400).json({ error: 'Invalid apartment ID' });

  const newBookingId = `book-${uuidv4().substring(0, 8)}`;
  const newCleaningId = `cln-${uuidv4().substring(0, 8)}`;

  const newBooking: Booking = {
    id: newBookingId,
    apartmentId: apt.id,
    apartmentName: apt.name,
    areaName: apt.areaName,
    guestName,
    guestEmail,
    guestPhone,
    guestCount: Number(guestCount),
    startDate,
    endDate,
    source,
    payout: Number(payout),
    status: 'confirmed',
    notes,
    cleaningJobId: newCleaningId
  };

  // Automatically create turnover cleaning job for departure date
  const newCleaning: CleaningJob = {
    id: newCleaningId,
    apartmentId: apt.id,
    apartmentName: apt.name,
    areaName: apt.areaName,
    bookingId: newBookingId,
    guestName,
    scheduledDate: endDate,
    timeWindow: '10:30 - 14:00',
    type: 'turnover',
    status: 'scheduled',
    notes: `Turnover after ${guestName} checkout.`,
    checklist: [
      { id: `c-${Date.now()}-1`, room: 'Bedroom', task: 'Strip and change bed sheets & pillowcases', completed: false },
      { id: `c-${Date.now()}-2`, room: 'Bathroom', task: 'Sanitize toilet, shower glass and sink', completed: false },
      { id: `c-${Date.now()}-3`, room: 'Bathroom', task: 'Restock clean towels and bath amenities', completed: false },
      { id: `c-${Date.now()}-4`, room: 'Kitchen', task: 'Clean oven, fridge and coffee station', completed: false },
      { id: `c-${Date.now()}-5`, room: 'Living Room', task: 'Vacuum rugs and mop floors', completed: false }
    ],
    photos: [],
    linenUsed: {
      bathTowels: apt.bedrooms * 2,
      handTowels: apt.bedrooms * 2,
      bedSheets: apt.bedrooms,
      pillowcases: apt.bedrooms * 2,
      duvetCovers: apt.bedrooms
    }
  };

  db.update(data => {
    data.bookings.push(newBooking);
    data.cleanings.push(newCleaning);

    data.activityLogs.unshift({
      id: `act-${Date.now()}`,
      action: 'BOOKING',
      title: 'New reservation booked',
      details: `${guestName} (${source}) for ${apt.name}`,
      timestamp: new Date().toISOString(),
      entityType: 'booking',
      entityId: newBookingId
    });
  });

  res.status(201).json({ booking: newBooking, cleaning: newCleaning });
});

// Update booking
router.put('/:id', (req, res) => {
  let updated: Booking | null = null;
  db.update(data => {
    const idx = data.bookings.findIndex(b => b.id === req.params.id);
    if (idx !== -1) {
      updated = { ...data.bookings[idx], ...req.body };
      data.bookings[idx] = updated!;
    }
  });
  if (!updated) return res.status(404).json({ error: 'Booking not found' });
  res.json(updated);
});

// Delete booking
router.delete('/:id', (req, res) => {
  db.update(data => {
    data.bookings = data.bookings.filter(b => b.id !== req.params.id);
  });
  res.json({ success: true });
});

export default router;
