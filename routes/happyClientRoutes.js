import express from 'express';
import { getHappyClients, createHappyClient, deleteHappyClient } from '../controllers/happyClientController.js';
import upload from '../middleware/upload.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getHappyClients);
router.post('/', protect, upload.single('image'), createHappyClient);
router.delete('/:id', protect, deleteHappyClient);

export default router;
