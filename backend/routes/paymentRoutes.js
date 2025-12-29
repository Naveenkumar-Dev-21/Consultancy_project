import express from 'express';
import {
    createRazorpayOrder,
    verifyPayment,
    getRazorpayKey,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/create-order').post(protect, createRazorpayOrder);
router.route('/verify').post(protect, verifyPayment);
router.route('/key').get(getRazorpayKey);

export default router;
