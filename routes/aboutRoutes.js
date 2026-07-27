import express from 'express';
import { getAboutContent, updateAboutContent } from '../controllers/aboutController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.route('/')
  .get(getAboutContent)
  .put(protect, upload.single('directorImage'), updateAboutContent);

export default router;
