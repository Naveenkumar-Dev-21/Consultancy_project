import express from 'express';
import {
    getCouriers,
    getCourierById,
    createCourier,
    updateCourier,
    deleteCourier
} from '../controllers/courierController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require admin authentication
router.route('/')
    .get(protect, admin, getCouriers)
    .post(protect, admin, createCourier);

router.route('/:id')
    .get(protect, admin, getCourierById)
    .put(protect, admin, updateCourier)
    .delete(protect, admin, deleteCourier);

export default router;
