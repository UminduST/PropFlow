import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';

import dashboardRoutes from './routes/dashboard.js';
import apartmentsRoutes from './routes/apartments.js';
import ownersRoutes from './routes/owners.js';
import bookingsRoutes from './routes/bookings.js';
import cleaningsRoutes from './routes/cleanings.js';
import maintenanceRoutes from './routes/maintenance.js';
import inventoryRoutes from './routes/inventory.js';
import lostItemsRoutes from './routes/lostItems.js';
import telegramRoutes from './routes/telegram.js';
import exportsRoutes from './routes/exports.js';
import usersRoutes from './routes/users.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Setup upload directory
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded photos statically
app.use('/uploads', express.static(uploadDir));

// Photo upload endpoint
app.post('/api/upload', upload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    success: true,
    url: fileUrl,
    filename: req.file.filename,
    mimetype: req.file.mimetype,
    size: req.file.size
  });
});

// Mount Routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/apartments', apartmentsRoutes);
app.use('/api/owners', ownersRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/cleanings', cleaningsRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/lost-items', lostItemsRoutes);
app.use('/api/telegram', telegramRoutes);
app.use('/api/exports', exportsRoutes);
app.use('/api/users', usersRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'PropFlow Server', timestamp: new Date().toISOString() });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 PropFlow API Server running on http://localhost:${PORT}`);
});
