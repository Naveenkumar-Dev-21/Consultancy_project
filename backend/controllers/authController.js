import User from "../models/User.js";
import jwt from "jsonwebtoken";

const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });

// @desc    Register new user with email/password
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    
    if (user) {
      // User exists - check if they only have Google auth
      if (user.authProvider === 'google' && !user.password) {
        // Google user wants to add password - link account
        user.password = password;
        user.authProvider = 'both';
        await user.save();
        
        return res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          picture: user.picture,
          authProvider: user.authProvider,
          token: generateToken(user._id, user.role),
          message: 'Password added to your Google account'
        });
      } else {
        return res.status(400).json({ error: "User already exists with this email" });
      }
    }

    // Create new user with local auth
    user = await User.create({ 
      name, 
      email, 
      password,
      authProvider: 'local'
    });

    // Check if admin email
    if (email === process.env.ADMIN_EMAIL && user.role !== "admin") {
      user.role = "admin";
      await user.save();
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      authProvider: user.authProvider,
      token: generateToken(user._id, user.role)
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Error creating user" });
  }
};

// @desc    Login user with email/password
// @route   POST /api/auth/login
// @access  PublicC
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Check if user has a password (might be Google-only user)
    if (!user.password) {
      return res.status(400).json({ 
        error: "This account was created with Google. Please login with Google or set a password first.",
        googleOnly: true
      });
    }

    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      picture: user.picture,
      authProvider: user.authProvider,
      token: generateToken(user._id, user.role)
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Error logging in" });
  }
};

// @desc    Google OAuth authentication
// @route   POST /api/auth/google
// @access  Public
export const googleAuth = async (req, res) => {
  try {
    const { googleId, email, name, picture } = req.body;

    // Find user by EMAIL (not googleId) for account linking
    let user = await User.findOne({ email });

    if (user) {
      // User exists - link Google account if not already linked
      let updated = false;
      
      if (!user.googleId) {
        user.googleId = googleId;
        updated = true;
      }
      
      if (!user.picture && picture) {
        user.picture = picture;
        updated = true;
      }
      
      // Update authProvider
      if (user.authProvider === 'local') {
        user.authProvider = 'both';
        updated = true;
      } else if (user.authProvider !== 'both' && user.authProvider !== 'google') {
        user.authProvider = 'google';
        updated = true;
      }
      
      if (updated) {
        await user.save();
      }
    } else {
      // Create new user with Google auth
      user = await User.create({
        googleId,
        email,
        name,
        picture,
        authProvider: 'google'
      });
    }

    // Check if admin email
    if (email === process.env.ADMIN_EMAIL && user.role !== "admin") {
      user.role = "admin";
      await user.save();
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      picture: user.picture,
      role: user.role,
      authProvider: user.authProvider,
      token: generateToken(user._id, user.role)
    });
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(500).json({ error: "Error with Google authentication" });
  }
};
