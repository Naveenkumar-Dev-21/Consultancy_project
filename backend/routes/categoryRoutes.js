import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();
import { getCategories, createCategory, deleteCategory, updateCategory } from '../controllers/categoryController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

// Ensure category upload directory exists
const categoryDir = 'uploads/categories/';
try {
    if (!fs.existsSync(categoryDir)) {
        fs.mkdirSync(categoryDir, { recursive: true });
    }
} catch (error) {
    console.error('Error creating upload directory:', error);
}

// Multer config for category images
const categoryStorage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, categoryDir);
    },
    filename(req, file, cb) {
        cb(
            null,
            `category-${Date.now()}${path.extname(file.originalname)}`
        );
    },
});

function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Images only!');
    }
}

const uploadCategory = multer({
    storage: categoryStorage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB max
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

// Multer error handler middleware
router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: `Upload error: ${err.message}` });
    } else if (err) {
        return res.status(400).json({ error: err.message });
    }
    next();
});

router.route('/')
    .get(getCategories)
    .post(protect, admin, uploadCategory.single('image'), createCategory);

router.route('/:id')
    .put(protect, admin, uploadCategory.single('image'), updateCategory)
    .delete(protect, admin, deleteCategory);

// Debug endpoint to check uploaded files (admin only)
router.get('/debug/files', protect, admin, (req, res) => {
    try {
        const uploadsDir = 'uploads/';
        if (!fs.existsSync(uploadsDir)) {
            return res.json({ error: 'uploads directory does not exist', path: uploadsDir });
        }
        
        const categoryDir = 'uploads/categories/';
        const categoryExists = fs.existsSync(categoryDir);
        
        let categoryFiles = [];
        if (categoryExists) {
            categoryFiles = fs.readdirSync(categoryDir);
        }
        
        res.json({
            uploadsDir: { exists: true, path: uploadsDir },
            categoryDir: { exists: categoryExists, path: categoryDir },
            categoryFiles: categoryFiles,
            totalFiles: categoryFiles.length
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
