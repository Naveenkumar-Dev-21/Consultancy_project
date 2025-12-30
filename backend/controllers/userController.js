import User from "../models/User.js";
import GoogleUser from "../models/GoogleUser.js";

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getProfile = async (req, res) => {
    try {
        // req.user is set by the protect middleware
        const user = req.user;

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            address: user.address || {
                street: '',
                city: '',
                postalCode: '',
                country: '',
                phone: ''
            },
            babyDetails: user.babyDetails || {
                name: '',
                gender: '',
                age: '',
                weight: '',
                size: ''
            }
        });
    } catch (error) {
        console.error("Error in getProfile:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res) => {
    try {
        const { name, address, babyDetails } = req.body;

        // Find user in either User or GoogleUser model
        let user = await User.findById(req.user._id);

        if (!user) {
            user = await GoogleUser.findById(req.user._id);
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update fields
        if (name) user.name = name;
        if (address) user.address = address;
        if (babyDetails) user.babyDetails = babyDetails;

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            address: updatedUser.address || {
                street: '',
                city: '',
                postalCode: '',
                country: '',
                phone: ''
            },
            babyDetails: updatedUser.babyDetails || {
                name: '',
                gender: '',
                age: '',
                weight: '',
                size: ''
            }
        });
    } catch (error) {
        console.error("Error in updateProfile:", error);
        res.status(500).json({ message: 'Server error' });
    }
};
