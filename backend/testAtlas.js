import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const testDb = async () => {
    try {
        console.log('Connecting to MONGO_URI...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected!');

        const userSchema = new mongoose.Schema({
            name: String,
            email: { type: String, unique: true },
            password: String
        });
        const User = mongoose.models.TestUser || mongoose.model('TestUser', userSchema);

        const email = `test_${Date.now()}@example.com`;
        const hashedPassword = await bcrypt.hash('password123', 10);
        
        console.log(`Attempting to create user with email: ${email}`);
        const user = await User.create({
            name: 'Test User',
            email,
            password: hashedPassword
        });
        console.log('User created successfully:', user._id);
        
        await mongoose.connection.close();
        console.log('Connection closed.');
    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
};

testDb();
