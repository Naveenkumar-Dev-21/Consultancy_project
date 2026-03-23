import path from 'path';
import express from 'express';
import multer from 'multer';
import fs from 'fs';


const router = express.Router();

// Ensure directories exist
const uploadDir = 'uploads/';
const categoryDir = 'uploads/categories/';

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(categoryDir)) {
    fs.mkdirSync(categoryDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(
            null,
            `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
        );
    },
});

const categoryStorage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/categories/');
    },
    filename(req, file, cb) {
        cb(
            null,
            `category-${Date.now()}${path.extname(file.originalname)}`
        );
    },
});

function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Images only!');
    }
}

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max per file
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

const uploadCategory = multer({
    storage: categoryStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

router.post('/', upload.single('image'), (req, res) => {
    // Return relative path with forward slashes for Windows compatibility, prefixed with slash
    res.send(`/${req.file.path.replace(/\\/g, '/')}`);
});

router.post('/category', uploadCategory.single('image'), (req, res) => {
    res.send(`/${req.file.path.replace(/\\/g, '/')}`);
});

// Multiple images upload endpoint (for description images)
router.post('/multiple', upload.array('images', 3), (req, res) => {
    const paths = req.files.map(file => `/${file.path.replace(/\\/g, '/')}`);
    res.json(paths);
});

export default router;
