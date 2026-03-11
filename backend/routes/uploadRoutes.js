import express from 'express';
import multer from 'multer';
import pkg from 'multer-storage-cloudinary';
import cloudinary from 'cloudinary';
import dotenv from 'dotenv';

const { CloudinaryStorage } = pkg;

dotenv.config();

// Configure Cloudinary
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const router = express.Router();

// Single image upload storage (for main product image)
const singleStorage = new CloudinaryStorage({
    cloudinary: cloudinary.v2,
    folder: 'aadhiran-products',
    allowedFormats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 1000, crop: 'limit', quality: 'auto' }],
});

// Multiple images upload storage (for description images)
const multipleStorage = new CloudinaryStorage({
    cloudinary: cloudinary.v2,
    folder: 'aadhiran-products/descriptions',
    allowedFormats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 800, crop: 'limit', quality: 'auto' }],
});

const singleUpload = multer({
    storage: singleStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

const multipleUpload = multer({
    storage: multipleStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Single image upload endpoint
router.post('/', singleUpload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        res.json(req.file.secure_url);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Multiple images upload endpoint (for description images)
router.post('/multiple', multipleUpload.array('images', 3), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }
        const paths = req.files.map(file => file.secure_url);
        res.json(paths);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
