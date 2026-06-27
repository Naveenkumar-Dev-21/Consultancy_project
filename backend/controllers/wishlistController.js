import Wishlist from '../models/Wishlist.js';
import { decryptProduct } from './productController.js';

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = async (req, res) => {
    try {
        let wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products');

        if (!wishlist) {
            return res.json({ products: [] });
        }

        res.json({ products: wishlist.products.map(decryptProduct) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle product in wishlist (add if not present, remove if present)
// @route   POST /api/wishlist/:productId
// @access  Private
export const toggleWishlistItem = async (req, res) => {
    try {
        const { productId } = req.params;

        let wishlist = await Wishlist.findOne({ user: req.user._id });

        if (!wishlist) {
            wishlist = new Wishlist({ user: req.user._id, products: [productId] });
            await wishlist.save();
            return res.json({ message: 'Added to wishlist', action: 'added' });
        }

        const index = wishlist.products.indexOf(productId);

        if (index > -1) {
            wishlist.products.splice(index, 1);
            await wishlist.save();
            return res.json({ message: 'Removed from wishlist', action: 'removed' });
        } else {
            wishlist.products.push(productId);
            await wishlist.save();
            return res.json({ message: 'Added to wishlist', action: 'added' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
