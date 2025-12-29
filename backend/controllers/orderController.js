import Order from '../models/Order.js';

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
        } = req.body;

        if (orderItems && orderItems.length === 0) {
            res.status(400).json({ message: 'No order items' });
            return;
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
        const order = await Order.findById(req.params.id).populate(
            'user',
            'name email'
        );

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
            order.status = 'confirmed';
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
            order.status = 'packed';
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

        if (order) {
            order.status = 'Shipped';

            // Add delivery details if provided
            if (req.body.deliveryMan) {
                order.deliveryDetails = {
                    name: req.body.deliveryMan.name,
                    phone: req.body.deliveryMan.phone,
                    vehicleNumber: req.body.deliveryMan.vehicleNumber,
                    otp: Math.floor(1000 + Math.random() * 9000).toString() // Generate 4-digit OTP
                };
            }

            if (req.body.estimatedDeliveryTime) {
                order.estimatedDeliveryTime = req.body.estimatedDeliveryTime;
            }

            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
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
