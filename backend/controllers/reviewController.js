import Review from '../models/Review.js';
import Product from '../models/Product.js';

// @desc    Create a new review
// @route   POST /api/reviews/:productId
// @access  Private
export const createReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const productId = req.params.productId;

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if user already reviewed this product
        const alreadyReviewed = await Review.findOne({
            product: productId,
            user: req.user._id,
        });

        if (alreadyReviewed) {
            return res.status(400).json({ message: 'Product already reviewed' });
        }

        // Create review
        const review = await Review.create({
            product: productId,
            user: req.user._id,
            name: req.user.name,
            rating: Number(rating),
            comment,
        });

        // Update product rating and review count
        await updateProductRating(productId);

        res.status(201).json({ message: 'Review added successfully', review });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all reviews for a product
// @route   GET /api/reviews/:productId
// @access  Public
export const getProductReviews = async (req, res) => {
    try {
        const productId = req.params.productId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const reviews = await Review.find({ product: productId, isApproved: true })
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip)
            .populate('user', 'name');

        const total = await Review.countDocuments({ product: productId, isApproved: true });

        res.json({
            reviews,
            page,
            pages: Math.ceil(total / limit),
            total,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
export const updateReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Check if user owns the review
        if (review.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to update this review' });
        }

        review.rating = rating || review.rating;
        review.comment = comment || review.comment;

        const updatedReview = await review.save();

        // Update product rating
        await updateProductRating(review.product);

        res.json({ message: 'Review updated successfully', review: updatedReview });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Check if user owns the review or is admin
        if (review.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
            return res.status(401).json({ message: 'Not authorized to delete this review' });
        }

        const productId = review.product;
        await Review.deleteOne({ _id: req.params.id });

        // Update product rating
        await updateProductRating(productId);

        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Helper function to update product rating and review count
const updateProductRating = async (productId) => {
    const reviews = await Review.find({ product: productId, isApproved: true });

    const numReviews = reviews.length;
    const rating = numReviews > 0
        ? reviews.reduce((acc, review) => acc + review.rating, 0) / numReviews
        : 0;

    await Product.findByIdAndUpdate(productId, {
        numReviews,
        rating,
    });
};
