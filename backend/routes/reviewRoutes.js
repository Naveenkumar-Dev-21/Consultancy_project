import express from 'express';
import {
    createReview,
    getProductReviews,
    updateReview,
    deleteReview,
} from '../controllers/reviewController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route to get reviews, protected route to create
router.route('/:productId')
    .get(getProductReviews)
    .post(protect, createReview);

// Protected routes for update and delete
router.route('/:id')
    .put(protect, updateReview)
    .delete(protect, deleteReview);

export default router;
