import { Router } from 'express';
import { db } from '../db.js';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const router = Router();

const generateTable = (doc: any, options: any) => {
  if (typeof autoTable === 'function') {
    (autoTable as any)(doc, options);
  } else if ((autoTable as any)?.default) {
    (autoTable as any).default(doc, options);
  } else if (typeof doc.autoTable === 'function') {
    doc.autoTable(options);
  }
};

// 1. APARTMENTS EXPORT
router.get('/apartments/:format', (req, res) => {
  const format = req.params.format.toLowerCase();
  const apartments = db.get().apartments;

  const data = apartments.map(a => ({
    ID: a.id,
    Name: a.name,
    Area: a.areaName,
    Address: a.address,
    Bedrooms: a.bedrooms,
    Bathrooms: a.bathrooms,
    MaxGuests: a.maxGuests,
    LockboxPIN: a.keyLockboxCode,
    SmartLock: a.smartLockPin || 'N/A',
    Owner: a.ownerName,
    Status: a.status.toUpperCase()
  }));

  if (format === 'csv') {
    const ws = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(ws);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="apartments-report.csv"');
    return res.send(csv);
  }

  if (format === 'excel' || format === 'xlsx') {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Apartments');
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="apartments-portfolio.xlsx"');
    return res.send(buffer);
  }

  if (format === 'pdf') {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(13, 19, 31);
    doc.text('PropFlow - Apartments Portfolio Report', 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} | Total Properties: ${apartments.length}`, 14, 28);

    generateTable(doc, {
      startY: 34,
      head: [['Apartment', 'Area', 'Address', 'Beds/Baths', 'Lockbox', 'Owner', 'Status']],
      body: apartments.map(a => [
        a.name,
        a.areaName,
        a.address,
        `${a.bedrooms} bed / ${a.bathrooms} bath`,
        a.keyLockboxCode,
        a.ownerName,
        a.status.toUpperCase()
      ]),
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] },
      styles: { fontSize: 9 }
    });

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="apartments-report.pdf"');
    return res.send(pdfBuffer);
  }

  res.status(400).json({ error: 'Unsupported format' });
});

// 2. BOOKINGS EXPORT
router.get('/bookings/:format', (req, res) => {
  const format = req.params.format.toLowerCase();
  const bookings = db.get().bookings;

  const data = bookings.map(b => ({
    ID: b.id,
    Apartment: b.apartmentName,
    Area: b.areaName,
    GuestName: b.guestName,
    CheckIn: b.startDate,
    CheckOut: b.endDate,
    Source: b.source,
    Guests: b.guestCount,
    PayoutUSD: b.payout,
    Status: b.status.toUpperCase(),
    Notes: b.notes || ''
  }));

  if (format === 'csv') {
    const ws = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(ws);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="bookings-report.csv"');
    return res.send(csv);
  }

  if (format === 'excel' || format === 'xlsx') {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Reservations');
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="bookings-report.xlsx"');
    return res.send(buffer);
  }

  if (format === 'pdf') {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(13, 19, 31);
    doc.text('PropFlow - Booking Reservations Report', 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} | Total Bookings: ${bookings.length}`, 14, 28);

    generateTable(doc, {
      startY: 34,
      head: [['Apartment', 'Guest', 'Dates', 'Source', 'Payout', 'Status']],
      body: bookings.map(b => [
        b.apartmentName,
        b.guestName,
        `${b.startDate} to ${b.endDate}`,
        b.source,
        `$${b.payout}`,
        b.status.toUpperCase()
      ]),
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] },
      styles: { fontSize: 8.5 }
    });

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="bookings-report.pdf"');
    return res.send(pdfBuffer);
  }

  res.status(400).json({ error: 'Unsupported format' });
});

// 3. MAINTENANCE EXPORT
router.get('/maintenance/:format', (req, res) => {
  const format = req.params.format.toLowerCase();
  const tasks = db.get().maintenance;

  const data = tasks.map(t => ({
    ID: t.id,
    Apartment: t.apartmentName,
    Issue: t.title,
    Category: t.category,
    Priority: t.priority.toUpperCase(),
    Status: t.status.toUpperCase(),
    Assignee: t.assigneeName || 'Unassigned',
    EstimatedBudgetUSD: t.estimatedBudget,
    ActualCostUSD: t.actualCost,
    ReportedBy: t.reportedBy,
    ReportedAt: t.reportedAt
  }));

  if (format === 'csv') {
    const ws = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(ws);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="maintenance-report.csv"');
    return res.send(csv);
  }

  if (format === 'excel' || format === 'xlsx') {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Maintenance');
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="maintenance-report.xlsx"');
    return res.send(buffer);
  }

  if (format === 'pdf') {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(13, 19, 31);
    doc.text('PropFlow - Maintenance & Work Orders Report', 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} | Active Tickets: ${tasks.length}`, 14, 28);

    generateTable(doc, {
      startY: 34,
      head: [['Apartment', 'Issue', 'Category', 'Priority', 'Status', 'Assignee', 'Cost']],
      body: tasks.map(t => [
        t.apartmentName,
        t.title,
        t.category,
        t.priority.toUpperCase(),
        t.status.toUpperCase(),
        t.assigneeName || 'Unassigned',
        `$${t.actualCost} / $${t.estimatedBudget}`
      ]),
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] },
      styles: { fontSize: 8.5 }
    });

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="maintenance-report.pdf"');
    return res.send(pdfBuffer);
  }

  res.status(400).json({ error: 'Unsupported format' });
});

export default router;
