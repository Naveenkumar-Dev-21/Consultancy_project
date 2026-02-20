import Courier from '../models/Courier.js';

// @desc    Get all couriers
// @route   GET /api/couriers
// @access  Private/Admin
export const getCouriers = async (req, res) => {
    try {
        const couriers = await Courier.find({}).sort({ createdAt: -1 });
        res.json(couriers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get courier by ID
// @route   GET /api/couriers/:id
// @access  Private/Admin
export const getCourierById = async (req, res) => {
    try {
        const courier = await Courier.findById(req.params.id);
        if (courier) {
            res.json(courier);
        } else {
            res.status(404).json({ message: 'Courier not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new courier
// @route   POST /api/couriers
// @access  Private/Admin
export const createCourier = async (req, res) => {
    try {
        const {
            companyName,
            contactPerson,
            phone,
            email,
            trackingUrlPattern,
            serviceable,
            estimatedDeliveryDays
        } = req.body;

        const courier = new Courier({
            companyName,
            contactPerson,
            phone,
            email,
            trackingUrlPattern,
            serviceable: serviceable !== undefined ? serviceable : true,
            estimatedDeliveryDays: estimatedDeliveryDays || 3
        });

        const createdCourier = await courier.save();
        res.status(201).json(createdCourier);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a courier
// @route   PUT /api/couriers/:id
// @access  Private/Admin
export const updateCourier = async (req, res) => {
    try {
        const courier = await Courier.findById(req.params.id);

        if (courier) {
            courier.companyName = req.body.companyName || courier.companyName;
            courier.contactPerson = req.body.contactPerson !== undefined ? req.body.contactPerson : courier.contactPerson;
            courier.phone = req.body.phone || courier.phone;
            courier.email = req.body.email !== undefined ? req.body.email : courier.email;
            courier.trackingUrlPattern = req.body.trackingUrlPattern !== undefined ? req.body.trackingUrlPattern : courier.trackingUrlPattern;
            courier.serviceable = req.body.serviceable !== undefined ? req.body.serviceable : courier.serviceable;
            courier.estimatedDeliveryDays = req.body.estimatedDeliveryDays || courier.estimatedDeliveryDays;

            const updatedCourier = await courier.save();
            res.json(updatedCourier);
        } else {
            res.status(404).json({ message: 'Courier not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a courier
// @route   DELETE /api/couriers/:id
// @access  Private/Admin
export const deleteCourier = async (req, res) => {
    try {
        const courier = await Courier.findById(req.params.id);

        if (courier) {
            await Courier.deleteOne({ _id: req.params.id });
            res.json({ message: 'Courier removed successfully' });
        } else {
            res.status(404).json({ message: 'Courier not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
