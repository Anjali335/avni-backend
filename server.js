import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { sanitizeData } from './middleware/validate.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import carRoutes from './routes/carRoutes.js';
import homeRoutes from './routes/homeRoutes.js';
import galleryRoutes from './routes/galleryRoutes.js';
import testimonialRoutes from './routes/testimonialRoutes.js';
import offerRoutes from './routes/offerRoutes.js';
import aboutRoutes from './routes/aboutRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import policyRoutes from './routes/policyRoutes.js';
import happyClientRoutes from './routes/happyClientRoutes.js';

dotenv.config();

// Connect to database
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

app.use(cors({
  origin: '*'
}));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use(globalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts from this IP, please try again after 15 minutes'
});

// Intercept JSON responses to rewrite localhost image URLs dynamically to the deployed Render origin
app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function (body) {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.headers['x-forwarded-host'] || req.get('host');
    const currentOrigin = `${protocol}://${host}`;
    
    if (body) {
      try {
        let serialized = JSON.stringify(body);
        // Replace localhost:5000 with the active deployed origin
        serialized = serialized.replace(/http:\/\/localhost:5000/g, currentOrigin);
        if (process.env.PORT && process.env.PORT !== '5000') {
          const regex = new RegExp(`http://localhost:${process.env.PORT}`, 'g');
          serialized = serialized.replace(regex, currentOrigin);
        }
        body = JSON.parse(serialized);
      } catch (err) {
        // Fallback silently if parsing fails
      }
    }
    return originalJson.call(this, body);
  };
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeData);

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve frontend static files
const frontendDistPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDistPath));

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/home', homeRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/happy-clients', happyClientRoutes);

// SPA routing fallback: serve index.html for non-API/non-uploads routes
app.get(/.*/, (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return next();
  }
  res.sendFile(path.join(frontendDistPath, 'index.html'), (err) => {
    if (err) {
      next();
    }
  });
});

// Basic route (fallback if index.html is missing)
app.get('/', (req, res) => {
  res.send('Car Dealer API is running...');
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
