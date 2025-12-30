import express from 'express';
import { getProfile, updateProfile } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Profile routes - all protected
router.route('/profile')
    .get(protect, getProfile)
    .put(protect, updateProfile);

export default router;
