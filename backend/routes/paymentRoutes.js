import express from 'express';
import {
    createRazorpayOrder,
    verifyPayment,
    getRazorpayKey,
    refundPayment,
} from '../controllers/paymentController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/create-order').post(protect, createRazorpayOrder);
router.route('/verify').post(protect, verifyPayment);
router.route('/key').get(getRazorpayKey);
router.route('/refund').post(protect, admin, refundPayment);

export default router;
