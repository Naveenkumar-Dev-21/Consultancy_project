import express from 'express';
import { getProfile, updateProfile, getUsers, deleteUser } from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Profile routes - all protected
router.route('/profile')
    .get(protect, getProfile)
    .put(protect, updateProfile);

router.route('/')
    .get(protect, admin, getUsers);

router.route('/:id')
    .delete(protect, admin, deleteUser);

export default router;
