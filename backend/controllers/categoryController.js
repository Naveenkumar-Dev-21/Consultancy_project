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
        const { name, subtitle, gradient, subCategories } = req.body;
        
        const categoryExists = await Category.findOne({ name });
        if (categoryExists) {
            return res.status(400).json({ error: 'Category already exists' });
        }

        const slug = slugify(name, { lower: true });
        
        // Handle image from file upload or request body
        let image = req.body.image;
        if (req.file) {
            image = `/${req.file.path.replace(/\\/g, '/')}`;
        }
        
        const category = await Category.create({
            name,
            slug,
            image,
            subtitle,
            gradient,
            subCategories: subCategories || []
        });

        res.status(201).json(category);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = async (req, res) => {
    try {
        const { name, subtitle, gradient, subCategories } = req.body;
        const category = await Category.findById(req.params.id);

        if (category) {
            category.name = name || category.name;
            category.subtitle = subtitle || category.subtitle;
            category.gradient = gradient || category.gradient;
            category.subCategories = subCategories || category.subCategories;

            // Handle image from file upload or request body
            if (req.file) {
                // Delete old image if it exists and is not a placeholder
                if (category.image && !category.image.startsWith('http') && category.image !== '/placeholder-category.png') {
                    const fs = await import('fs');
                    const path = await import('path');
                    const __dirname = path.resolve();
                    const relativePath = category.image.startsWith('/') ? category.image.substring(1) : category.image;
                    const fullPath = path.join(__dirname, relativePath);
                    
                    if (fs.existsSync(fullPath)) {
                        try {
                            fs.unlinkSync(fullPath);
                        } catch (err) {
                            console.error(`Failed to delete old category image: ${fullPath}`, err);
                        }
                    }
                }
                category.image = `/${req.file.path.replace(/\\/g, '/')}`;
            } else if (req.body.image) {
                category.image = req.body.image;
            }

            if (name) {
                category.slug = slugify(name, { lower: true });
            }

            const updatedCategory = await category.save();
            res.json(updatedCategory);
        } else {
            res.status(404).json({ error: 'Category not found' });
        }
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
        
        // Delete image from filesystem
        if (category.image && !category.image.startsWith('http') && category.image !== '/placeholder-category.png') {
            const fs = await import('fs');
            const path = await import('path');
            const __dirname = path.resolve();

            // Remove leading slash if present to make it relative to root
            const relativePath = category.image.startsWith('/') ? category.image.substring(1) : category.image;
            const fullPath = path.join(__dirname, relativePath);
            
            if (fs.existsSync(fullPath)) {
                try {
                    fs.unlinkSync(fullPath);
                } catch (err) {
                    console.error(`Failed to delete category image: ${fullPath}`, err);
                }
            }
        }

        await Category.deleteOne({ _id: req.params.id });
        res.json({ message: 'Category removed and image deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
