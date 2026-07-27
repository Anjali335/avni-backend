import express from 'express';
import { getOffers, createOffer, updateOffer, deleteOffer } from '../controllers/offerController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/', getOffers);
router.post('/', protect, upload.single('image'), createOffer);
router.put('/:id', protect, upload.single('image'), updateOffer);
router.delete('/:id', protect, deleteOffer);

export default router;
