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
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            couponCode,
            discountAmount,
        } = req.body;

        if (orderItems && orderItems.length === 0) {
            res.status(400).json({ message: 'No order items' });
            return;
        }

        // Check stock availability and decrement stock
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

            // Decrement stock
            product.stock -= item.qty;
            await product.save();
        }

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
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            couponCode: couponCode || undefined,
            discountAmount: discountAmount || 0,
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
        const orders = await Order.find({}).populate('user', 'id name email').populate('courier');
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
            .populate('user', 'name email')
            .populate('courier');

        if (order) {
            res.json(order);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Confirm order
// @route   PUT /api/orders/:id/confirm
// @access  Private/Admin
export const confirmOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            order.status = 'Confirmed';
            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Pack order
// @route   PUT /api/orders/:id/pack
// @access  Private/Admin
export const packOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            order.status = 'Packed';
            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Ship order
// @route   PUT /api/orders/:id/ship
// @access  Private/Admin
export const shipOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }

        const { courierId, trackingId, estimatedDeliveryTime } = req.body;

        // Validate courier exists and is serviceable
        if (courierId) {
            const Courier = (await import('../models/Courier.js')).default;
            const courier = await Courier.findById(courierId);
            
            if (!courier) {
                res.status(404).json({ message: 'Courier not found' });
                return;
            }
            
            if (!courier.serviceable) {
                res.status(400).json({ message: 'Selected courier is not currently serviceable' });
                return;
            }

            order.courier = courierId;
        }

        if (trackingId) {
            order.trackingId = trackingId;
        }

        if (estimatedDeliveryTime) {
            order.estimatedDeliveryTime = estimatedDeliveryTime;
        }

        // Generate OTP for delivery verification
        order.deliveryDetails = {
            otp: Math.floor(1000 + Math.random() * 9000).toString() // Generate 4-digit OTP
        };

        order.status = 'Shipped';
        const updatedOrder = await order.save();
        
        // Populate courier information before returning
        await updatedOrder.populate('courier');
        
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
