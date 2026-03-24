import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
    try {
        const {
            orderItems,
            shippingAddress,
            paymentMethod,
            couponCode,
            discountAmount,
        } = req.body;

        if (!orderItems || orderItems.length === 0) {
            res.status(400).json({ message: 'No order items' });
            return;
        }

        // Server-side price recalculation to prevent price manipulation
        let calculatedItemsPrice = 0;

        // Check stock availability, verify prices, and decrement stock
        for (const item of orderItems) {
            const product = await Product.findById(item.product);

            if (!product) {
                res.status(404).json({ message: `Product ${item.name} not found` });
                return;
            }

            if (product.stock < item.qty) {
                res.status(400).json({
                    message: `Insufficient stock for ${item.name}. Only ${product.stock} available.`
                });
                return;
            }

            // Use server-side price, not client-provided price
            item.price = product.price;
            calculatedItemsPrice += product.price * item.qty;

            // Decrement stock
            product.stock -= item.qty;
            await product.save();
        }

        // Recalculate discount server-side if a coupon is provided
        let calculatedDiscount = 0;
        if (couponCode) {
            const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
            
            if (coupon) {
                // Check if coupon is valid (expiry, usage limit, min amount)
                const isExpired = new Date() > coupon.expiresAt;
                const limitReached = coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit;
                const minAmountMet = calculatedItemsPrice >= coupon.minOrderAmount;

                if (!isExpired && !limitReached && minAmountMet) {
                    if (coupon.discountType === 'percentage') {
                        calculatedDiscount = (calculatedItemsPrice * coupon.discountValue) / 100;
                        if (coupon.maxDiscount !== null && calculatedDiscount > coupon.maxDiscount) {
                            calculatedDiscount = coupon.maxDiscount;
                        }
                    } else {
                        calculatedDiscount = coupon.discountValue;
                    }
                }
            }
        }

        // Recalculate totals server-side
        const calculatedTaxPrice = Math.round(calculatedItemsPrice * 0.05); // 5% tax
        const calculatedShippingPrice = calculatedItemsPrice > 500 ? 0 : 50;
        const validDiscount = Math.min(calculatedDiscount, calculatedItemsPrice);
        const calculatedTotalPrice = calculatedItemsPrice + calculatedTaxPrice + calculatedShippingPrice - validDiscount;

        // If coupon code was used, increment its usedCount
        if (couponCode) {
            await Coupon.findOneAndUpdate(
                { code: couponCode.toUpperCase() },
                { $inc: { usedCount: 1 } }
            );
        }

        const order = new Order({
            orderItems,
            user: req.user._id,
            shippingAddress,
            paymentMethod,
            itemsPrice: calculatedItemsPrice,
            taxPrice: calculatedTaxPrice,
            shippingPrice: calculatedShippingPrice,
            totalPrice: calculatedTotalPrice,
            couponCode: couponCode || undefined,
            discountAmount: validDiscount,
        });

        const createdOrder = await order.save();
        res.status(201).json(createdOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).populate('user', 'id name email');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Authorization: only the order owner or an admin can view the order
        if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to view this order' });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update order status (manual admin update)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const { status } = req.body;
        const validStatuses = ['Processing', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];

        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
        }

        // Save old status before overwriting (needed for stock restore check)
        const oldStatus = order.status;
        order.status = status;

        // Auto-set delivery fields when marked as delivered
        if (status === 'Delivered') {
            order.isDelivered = true;
            order.deliveredAt = new Date();
        }

        // If cancelling (and wasn't already cancelled), restore stock
        if (status === 'Cancelled' && oldStatus !== 'Cancelled') {
            for (const item of order.orderItems) {
                const product = await Product.findById(item.product);
                if (product) {
                    product.stock += item.qty;
                    await product.save();
                }
            }
        }

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


// @desc    Get all invoices (orders)
// @route   GET /api/orders/invoices
// @access  Private/Admin
export const getInvoices = async (req, res) => {
    try {
        const orders = await Order.find({}).populate('user', 'id name email');

        // Map orders to invoice format
        const invoices = orders.map(order => ({
            _id: order._id,
            order: order,
            user: order.user,
            amount: order.totalPrice,
            createdAt: order.createdAt
        }));

        res.json(invoices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
export const deleteOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Restore stock for each item
        for (const item of order.orderItems) {
            const product = await Product.findById(item.product);
            if (product) {
                product.stock += item.qty;
                await product.save();
            }
        }

        await Order.findByIdAndDelete(req.params.id);
        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Cancel order (user)
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Verify the user owns this order
        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to cancel this order' });
        }

        // Only allow cancellation if order is still Processing
        if (order.status !== 'Processing') {
            return res.status(400).json({ message: `Cannot cancel order with status '${order.status}'` });
        }

        // Restore stock for each item
        for (const item of order.orderItems) {
            const product = await Product.findById(item.product);
            if (product) {
                product.stock += item.qty;
                await product.save();
            }
        }

        const { cancellationReason } = req.body;
        order.status = 'Cancelled';
        order.cancellationReason = cancellationReason || 'No reason provided';
        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
