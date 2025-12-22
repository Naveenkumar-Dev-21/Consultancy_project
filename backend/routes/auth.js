import express from 'express';
import User from '../models/users.js';

const router = express.Router();

// Signup route
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, avatar } = req.body;
    const user = await User.register({ name, email, password, avatar });
    const token = user.generateJWT();
    res.status(201).json({ message: 'User created successfully', token, user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.authenticate({ email, password });
    const token = user.generateJWT();
    res.json({ message: 'Login successful', token, user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar } });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Google signup/login route - expects profile data from frontend
router.post('/google', async (req, res) => {
  try {
    const profile = req.body; // Assuming frontend sends Google profile object
    const user = await User.findOrCreateGoogle(profile);
    const token = user.generateJWT();
    res.json({ message: 'Google auth successful', token, user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;