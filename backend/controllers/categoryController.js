import Category from '../models/Category.js';
import slugify from 'slugify';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({}).sort({ createdAt: -1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = async (req, res) => {
    try {
        const { name, image, subtitle, gradient } = req.body;
        
        const categoryExists = await Category.findOne({ name });
        if (categoryExists) {
            return res.status(400).json({ error: 'Category already exists' });
        }

        const slug = slugify(name, { lower: true });
        
        const category = await Category.create({
            name,
            slug,
            image,
            subtitle,
            gradient
        });

        res.status(201).json(category);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }
        
        await Category.deleteOne({ _id: req.params.id });
        res.json({ message: 'Category removed' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
