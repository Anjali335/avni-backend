import express from 'express';
import { getPolicy, updatePolicy } from '../controllers/policyController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:type', getPolicy);
router.put('/:type', protect, updatePolicy);

export default router;
