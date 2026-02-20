import express from 'express';
import {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    getRecommendations,
    getSimilarProducts,
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Static routes MUST come before :id param routes
router.route('/search').get(searchProducts);
router.route('/recommendations').get(protect, getRecommendations);

router.route('/').get(getProducts).post(protect, admin, createProduct);
router.route('/:id/similar').get(getSimilarProducts);
router
    .route('/:id')
    .get(getProductById)
    .put(protect, admin, updateProduct)
    .delete(protect, admin, deleteProduct);

export default router;
