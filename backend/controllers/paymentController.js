import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order.js';

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create Razorpay order
// @route   POST /api/payment/create-order
// @access  Private
export const createRazorpayOrder = async (req, res) => {
    try {
        // Check if environment variables are set
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            console.error('Missing Razorpay credentials in environment variables');
            return res.status(500).json({ 
                message: 'Failed to create payment order', 
                error: 'Razorpay credentials not configured' 
            });
        }

        const { orderId, currency = 'INR' } = req.body;

        // Fetch order from database to get validated amount
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ 
                message: 'Order not found',
                error: `No order found with ID: ${orderId}`
            });
        }

        // Check if order belongs to the user
        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ 
                message: 'Not authorized',
                error: 'Order does not belong to this user'
            });
        }

        // Check if order is already paid
        if (order.isPaid) {
            return res.status(400).json({ 
                message: 'Order already paid',
                error: 'Payment has already been processed for this order'
            });
        }

        const amount = order.totalPrice;

        // Razorpay expects amount in smallest currency unit (paise for INR)
        const options = {
            amount: Math.round(amount * 100), // amount in paise
            currency,
            receipt: `rcpt_${orderId.toString().substring(0, 18)}_${Date.now().toString().substring(8)}`, // Max 40 chars
        };

        // Initialize Razorpay instance check
        if (!razorpay || !razorpay.orders) {
            console.error('Razorpay SDK not properly initialized');
            return res.status(500).json({ 
                message: 'Internal server error', 
                error: 'Razorpay initialization failed' 
            });
        }

        const razorpayOrder = await razorpay.orders.create(options);

        res.json({
            orderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key: process.env.RAZORPAY_KEY_ID, // Send key ID to frontend
        });
    } catch (error) {
        console.error('Razorpay order creation error:', error);
        res.status(500).json({ 
            message: 'Failed to create payment order', 
            error: error instanceof Error ? error.message : 'Unknown error' 
        });
    }
};

// @desc    Verify Razorpay payment signature
// @route   POST /api/payment/verify
// @access  Private
export const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderId, // Our database order ID
        } = req.body;

        // Create signature for verification
        const body = razorpay_order_id + '|' + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Update order payment status in database
            const order = await Order.findById(orderId);

            if (order) {
                order.isPaid = true;
                order.paidAt = Date.now();
                order.paymentResult = {
                    id: razorpay_payment_id,
                    status: 'success',
                    update_time: new Date().toISOString(),
                };

                await order.save();

                res.json({
                    success: true,
                    message: 'Payment verified successfully',
                    orderId: order._id,
                });
            } else {
                res.status(404).json({ success: false, message: 'Order not found' });
            }
        } else {
            res.status(400).json({ success: false, message: 'Payment verification failed' });
        }
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({ success: false, message: 'Payment verification error', error: error.message });
    }
};

// @desc    Get Razorpay key (for frontend)
// @route   GET /api/payment/key
// @access  Public
export const getRazorpayKey = async (req, res) => {
    res.json({ key: process.env.RAZORPAY_KEY_ID });
};

// @desc    Initiate refund for a cancelled order
// @route   POST /api/payment/refund
// @access  Private/Admin
export const refundPayment = async (req, res) => {
    try {
        const { orderId } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.status !== 'Cancelled') {
            return res.status(400).json({ message: 'Refund can only be initiated for cancelled orders' });
        }

        if (!order.isPaid || !order.paymentResult?.id) {
            return res.status(400).json({ message: 'No online payment found for this order. Refund not applicable.' });
        }

        if (order.refundStatus === 'initiated' || order.refundStatus === 'completed') {
            return res.status(400).json({ message: `Refund already ${order.refundStatus}` });
        }

        // Initiate refund via Razorpay
        const refund = await razorpay.payments.refund(order.paymentResult.id, {
            amount: order.totalPrice * 100, // amount in paise
            speed: 'normal',
            notes: {
                orderId: order._id.toString(),
                reason: order.cancellationReason || 'Order cancelled'
            }
        });

        order.refundStatus = 'initiated';
        order.refundId = refund.id;
        await order.save();

        res.json({
            success: true,
            message: 'Refund initiated successfully',
            refundId: refund.id,
            refundStatus: 'initiated'
        });
    } catch (error) {
        console.error('Refund error:', error);

        // Update order to reflect failed refund attempt
        try {
            const order = await Order.findById(req.body.orderId);
            if (order) {
                order.refundStatus = 'failed';
                await order.save();
            }
        } catch (e) {
            console.error('Failed to update order refund status:', e);
        }

        res.status(500).json({
            success: false,
            message: 'Refund failed',
            error: error.message
        });
    }
};
