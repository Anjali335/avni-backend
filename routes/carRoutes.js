import express from 'express';
import { getCars, getCarById, createCar, updateCar, deleteCar, getFilterOptions } from '../controllers/carController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/filters', getFilterOptions);
router.get('/', getCars);
router.get('/:id', getCarById);

// Admin-only routes
router.post(
  '/',
  protect,
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'galleryImages', maxCount: 10 },
  ]),
  createCar
);

router.put(
  '/:id',
  protect,
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'galleryImages', maxCount: 10 },
  ]),
  updateCar
);

router.delete('/:id', protect, deleteCar);

export default router;
