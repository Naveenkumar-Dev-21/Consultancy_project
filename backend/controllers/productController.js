import Product from '../models/Product.js';
import { encrypt, decrypt } from '../utils/encryption.js';

/**
 * Decrypts encrypted image fields on a product object.
 * Shared helper to eliminate duplication across all product endpoints.
 * @param {Object} product - Mongoose document or plain object
 * @returns {Object} Plain object with decrypted image fields
 */
export const decryptProduct = (product) => {
    const obj = product.toObject ? product.toObject() : { ...product };
    obj.image = decrypt(obj.image);
    if (obj.descriptionImages?.length > 0) {
        obj.descriptionImages = obj.descriptionImages.map(img => decrypt(img));
    }
    return obj;
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products.map(decryptProduct));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            res.json(decryptProduct(product));
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
    try {
        const encryptedImage = encrypt(req.body.image);

        let encryptedDescImages = [];
        if (req.body.descriptionImages?.length > 0) {
            encryptedDescImages = req.body.descriptionImages.map(img => encrypt(img));
        }

        const product = new Product({
            name: req.body.name,
            price: req.body.price,
            originalPrice: req.body.originalPrice || 0,
            user: req.user._id,
            image: encryptedImage,
            descriptionImages: encryptedDescImages,
            brand: req.body.brand || 'Generic',
            category: req.body.category,
            subCategory: req.body.subCategory || '',
            stock: req.body.stock || 0,
            description: req.body.description,
            ageGroup: req.body.ageGroup || [],
            sizes: req.body.sizes || [],
            gender: req.body.gender || 'Unisex',
            code: req.body.code || undefined
        });

        const createdProduct = await product.save();
        res.status(201).json(decryptProduct(createdProduct));
    } catch (error) {
        console.error('createProduct error:', error.message, error);
        res.status(400).json({ 
            message: error.message, 
            details: error.errors ? Object.keys(error.errors).map(k => error.errors[k].message) : null 
        });
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        product.name = req.body.name || product.name;
        product.price = req.body.price || product.price;
        product.description = req.body.description || product.description;

        if (req.body.image) {
            product.image = encrypt(req.body.image);
        }

        if (req.body.descriptionImages) {
            product.descriptionImages = req.body.descriptionImages.map(img => encrypt(img));
        }

        product.brand = req.body.brand || product.brand;
        product.category = req.body.category || product.category;
        product.subCategory = req.body.subCategory !== undefined ? req.body.subCategory : product.subCategory;
        product.stock = req.body.stock !== undefined ? req.body.stock : product.stock;
        product.ageGroup = req.body.ageGroup !== undefined ? req.body.ageGroup : product.ageGroup;
        product.markModified('ageGroup');
        product.sizes = req.body.sizes !== undefined ? req.body.sizes : product.sizes;
        product.gender = req.body.gender || product.gender;
        product.originalPrice = req.body.originalPrice !== undefined ? req.body.originalPrice : product.originalPrice;
        product.code = req.body.code !== undefined ? req.body.code : product.code;

        const updatedProduct = await product.save();
        res.json(decryptProduct(updatedProduct));
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            // Delete images from filesystem
            const fs = await import('fs');
            const path = await import('path');
            const __dirname = path.resolve();

            // Helper to delete a file safely
            const deleteFile = (filePath) => {
                if (!filePath) return;
                // Decrypt the path if it's encrypted (it's stored encrypted in DB)
                const decryptedPath = decrypt(filePath);
                // Remove leading slash if present to make it relative to root
                const relativePath = decryptedPath.startsWith('/') ? decryptedPath.substring(1) : decryptedPath;
                const fullPath = path.join(__dirname, relativePath);
                
                if (fs.existsSync(fullPath)) {
                    try {
                        fs.unlinkSync(fullPath);
                    } catch (err) {
                        console.error(`Failed to delete file: ${fullPath}`, err);
                    }
                }
            };

            // Delete main image
            deleteFile(product.image);

            // Delete description images
            if (product.descriptionImages && product.descriptionImages.length > 0) {
                product.descriptionImages.forEach(img => deleteFile(img));
            }

            await Product.deleteOne({ _id: req.params.id });
            res.json({ message: 'Product removed and images deleted' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Search products with filters
// @route   GET /api/products/search
// @access  Public
export const searchProducts = async (req, res) => {
    try {
        const { q, category, subCategory, minPrice, maxPrice, size, ageGroup } = req.query;

        const filter = {};

        if (q) {
            filter.name = { $regex: q, $options: 'i' };
        }
        if (category && category !== 'All') {
            filter.category = category;
        }
        if (subCategory) {
            filter.subCategory = subCategory;
        }
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }
        if (size) {
            filter.sizes = size;
        }
        if (ageGroup) {
            filter.ageGroup = { $elemMatch: { ageGroup: ageGroup } };
        }
        if (req.query.gender) {
            filter.gender = req.query.gender;
        }

        const products = await Product.find(filter);
        res.json(products.map(decryptProduct));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get personalized product recommendations based on order history
// @route   GET /api/products/recommendations
// @access  Private
export const getRecommendations = async (req, res) => {
    try {
        const Order = (await import('../models/Order.js')).default;

        // Get user's order history
        const orders = await Order.find({ user: req.user._id });

        // Extract categories and product IDs from orders
        const orderedProductIds = [];
        const orderedCategories = [];

        orders.forEach(order => {
            order.orderItems.forEach(item => {
                orderedProductIds.push(item.product.toString());
            });
        });

        // Get categories of ordered products
        if (orderedProductIds.length > 0) {
            const orderedProducts = await Product.find({ _id: { $in: orderedProductIds } });
            orderedProducts.forEach(p => {
                if (p.category && !orderedCategories.includes(p.category)) {
                    orderedCategories.push(p.category);
                }
            });
        }

        let recommendations = [];

        if (orderedCategories.length > 0) {
            recommendations = await Product.find({
                category: { $in: orderedCategories },
                _id: { $nin: orderedProductIds },
            }).limit(10);
        }

        // If not enough recommendations, fill with top-rated products
        if (recommendations.length < 5) {
            const existingIds = recommendations.map(r => r._id.toString());
            const filler = await Product.find({
                _id: { $nin: [...orderedProductIds, ...existingIds] },
            })
                .sort({ rating: -1 })
                .limit(5 - recommendations.length);
            recommendations = [...recommendations, ...filler];
        }

        res.json(recommendations.map(decryptProduct));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get similar products (same category, excluding current)
// @route   GET /api/products/:id/similar
// @access  Public
export const getSimilarProducts = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const similarProducts = await Product.find({
            category: product.category,
            _id: { $ne: product._id },
        }).limit(5);

        res.json(similarProducts.map(decryptProduct));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
