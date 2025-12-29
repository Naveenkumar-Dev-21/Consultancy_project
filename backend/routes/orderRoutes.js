import express from 'express';
import {
    createOrder,
    getOrders,
    getMyOrders,
    getOrderById,
    confirmOrder,
    packOrder,
    shipOrder,
    getInvoices,
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, createOrder).get(protect, admin, getOrders);
router.route('/myorders').get(protect, getMyOrders);
router.route('/invoices').get(protect, admin, getInvoices);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/confirm').put(protect, admin, confirmOrder);
router.route('/:id/pack').put(protect, admin, packOrder);
router.route('/:id/ship').put(protect, admin, shipOrder);

export default router;
