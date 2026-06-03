import User from "../models/User.js";
import PendingUser from "../models/PendingUser.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { OAuth2Client } from 'google-auth-library';
import { sendOtpEmail } from "../utils/sendEmail.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });

/**
 * Generate a 6-digit numeric OTP
 */
const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// @desc    Register new user — Step 1: Send OTP to email
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (process.env.NODE_ENV !== 'production') console.log(`[AUTH] Signup attempt for: ${email}`);

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Please provide all required fields (name, email, password)" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // Check if user already exists in the main User collection
    let user = await User.findOne({ email });
    
    if (user) {
      if (process.env.NODE_ENV !== 'production') console.log(`[AUTH] User already exists: ${email}`);
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

    // Generate OTP
    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Upsert pending user (replace if they re-submit the form)
    // Delete any existing pending registration for this email, then create new
    await PendingUser.deleteOne({ email });
    const pendingUser = new PendingUser({ name, email, password, otp, otpExpires });
    await pendingUser.save(); // pre-save hook hashes the password

    // Send OTP email
    await sendOtpEmail(email, otp, name);

    if (process.env.NODE_ENV !== 'production') console.log(`[AUTH] OTP sent to: ${email}`);
    res.status(200).json({ 
      message: "Verification code sent to your email",
      email // Send back email so frontend knows which email to verify
    });
  } catch (error) {
    console.error("Signup error details:", error);
    res.status(500).json({ error: `Error during registration: ${error.message}` });
  }
};

// @desc    Verify OTP and create user — Step 2
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "Please provide email and verification code" });
    }

    // Find the pending user
    const pendingUser = await PendingUser.findOne({ email });

    if (!pendingUser) {
      return res.status(400).json({ 
        error: "Verification code expired or not found. Please register again.",
        expired: true
      });
    }

    // Check max attempts (prevent brute-force OTP guessing)
    if (pendingUser.attempts >= 5) {
      await PendingUser.deleteOne({ email });
      return res.status(400).json({ 
        error: "Too many failed attempts. Please register again.",
        expired: true
      });
    }

    // Check if OTP has expired
    if (pendingUser.otpExpires < new Date()) {
      await PendingUser.deleteOne({ email });
      return res.status(400).json({ 
        error: "Verification code has expired. Please register again.",
        expired: true
      });
    }

    // Verify OTP
    if (pendingUser.otp !== otp.trim()) {
      pendingUser.attempts += 1;
      await pendingUser.save();
      const remaining = 5 - pendingUser.attempts;
      return res.status(400).json({ 
        error: `Invalid verification code. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`
      });
    }

    // OTP is valid — create the real user with pre-hashed password
    const user = new User({
      name: pendingUser.name,
      email: pendingUser.email,
      password: pendingUser.password, // Already hashed in PendingUser
      authProvider: 'local'
    });
    // Mark password as NOT modified so User's pre-save hook doesn't double-hash
    user.$skipPasswordHash = true;
    await user.save();

    // Check if admin email (supports comma-separated list)
    const adminEmails = (process.env.ADMIN_EMAIL || '').split(',').map(e => e.trim().toLowerCase());
    if (adminEmails.includes(email.toLowerCase()) && user.role !== "admin") {
      user.role = "admin";
      await user.save();
    }

    // Delete the pending user
    await PendingUser.deleteOne({ email });

    if (process.env.NODE_ENV !== 'production') console.log(`[AUTH] Email verified & user created: ${email}`);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      authProvider: user.authProvider,
      token: generateToken(user._id, user.role)
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ error: "Error verifying code. Please try again." });
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const pendingUser = await PendingUser.findOne({ email });

    if (!pendingUser) {
      return res.status(400).json({ 
        error: "No pending registration found. Please register again.",
        expired: true
      });
    }

    // Generate new OTP
    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    pendingUser.otp = otp;
    pendingUser.otpExpires = otpExpires;
    pendingUser.attempts = 0;
    pendingUser.createdAt = new Date(); // Reset TTL
    await pendingUser.save();

    // Send new OTP
    await sendOtpEmail(email, otp, pendingUser.name);

    if (process.env.NODE_ENV !== 'production') console.log(`[AUTH] OTP resent to: ${email}`);
    res.status(200).json({ message: "New verification code sent to your email" });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({ error: "Error resending code. Please try again." });
  }
};

// @desc    Login user with email/password
// @route   POST /api/auth/login
// @access  PublicC
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (process.env.NODE_ENV !== 'production') console.log(`[AUTH] Login attempt for: ${email}`);

    if (!email || !password) {
      return res.status(400).json({ error: "Please provide both email and password" });
    }

    const user = await User.findOne({ email });
    
    if (!user) {
      if (process.env.NODE_ENV !== 'production') console.log(`[AUTH] User not found: ${email}`);
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Check if user has a password (might be Google-only user)
    if (!user.password) {
      if (process.env.NODE_ENV !== 'production') console.log(`[AUTH] Google-only account attempting password login: ${email}`);
      return res.status(400).json({ 
        error: "This account was created with Google. Please login with Google or set a password first.",
        googleOnly: true
      });
    }

    // Verify password
    const isMatch = await user.matchPassword(password);
    if (process.env.NODE_ENV !== 'production') console.log(`[AUTH] Password match result for ${email}`);
    
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (process.env.NODE_ENV !== 'production') console.log(`[AUTH] Login successful for: ${email}`);
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
    console.error("Login error details:", error);
    res.status(500).json({ error: "Error logging in" });
  }
};

// @desc    Google OAuth authentication
// @route   POST /api/auth/google
// @access  Public
export const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: 'Google credential token is required' });
    }

    // Verify the Google ID token server-side
    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: [
            process.env.GOOGLE_CLIENT_ID,
            "361521861568-cibr1ba5k55h0tk3pfo6qvfdcr7rrmmj.apps.googleusercontent.com"
        ],
      });
      payload = ticket.getPayload();
    } catch (verifyError) {
      return res.status(401).json({ error: 'Invalid Google token' });
    }

    const { sub: googleId, email, name, picture } = payload;

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

    // Check if admin email (supports comma-separated list)
    const adminEmails = (process.env.ADMIN_EMAIL || '').split(',').map(e => e.trim().toLowerCase());
    if (adminEmails.includes(email.toLowerCase()) && user.role !== "admin") {
      user.role = "admin";
      await user.save();
    }

    // Check if token generation is possible
    if (!process.env.JWT_SECRET) {
      console.error("CRITICAL ERROR: JWT_SECRET is not defined in environment variables!");
      throw new Error("Server configuration error: JWT_SECRET missing");
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
    console.error("Google auth error:", error.message);
    res.status(500).json({ 
      error: "Error with Google authentication",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
