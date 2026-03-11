import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const testCloudinary = async () => {
    try {
        console.log('Testing Cloudinary upload...');
        console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
        // Using a small transparent pixel as test image data (base64)
        const testImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
        
        const result = await cloudinary.uploader.upload(testImage, {
            folder: 'test-folder'
        });
        
        console.log('Upload Successful!');
        console.log('URL:', result.secure_url);
    } catch (error) {
        console.error('Cloudinary Test Failed:', error);
    }
};

testCloudinary();
