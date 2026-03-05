import User from "../models/User.js";

// Shared helper to format user response with fallback defaults
const serializeUser = (user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    picture: user.picture,
    authProvider: user.authProvider,
    address: user.address || { street: '', city: '', postalCode: '', country: '', phone: '' },
    babyDetails: user.babyDetails || { name: '', gender: '', age: '', weight: '', size: '' },
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getProfile = async (req, res) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(serializeUser(user));
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

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (name) user.name = name;
        if (address) user.address = address;
        if (babyDetails) user.babyDetails = babyDetails;

        const updatedUser = await user.save();
        res.json(serializeUser(updatedUser));
    } catch (error) {
        console.error("Error in updateProfile:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        console.error("Error in getUsers:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await User.deleteOne({ _id: req.params.id });
        res.json({ message: 'User removed' });
    } catch (error) {
        console.error("Error in deleteUser:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

