import express from 'express';
import { getHomeContent, updateHomeContent } from '../controllers/homeController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/', getHomeContent);
router.put('/', protect, upload.single('heroImage'), updateHomeContent);

export default router;
