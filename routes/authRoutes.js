import express from 'express';
import { authAdmin, getAdminProfile, changePassword } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', authAdmin);
router.route('/profile').get(protect, getAdminProfile);
router.route('/change-password').put(protect, changePassword);

export default router;
