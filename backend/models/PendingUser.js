import mongoose from "mongoose";

/**
 * PendingUser Model
 * 
 * Stores temporary user registrations that are waiting for email OTP verification.
 * Uses a MongoDB TTL index to automatically delete expired entries after 10 minutes.
 * Once the OTP is verified, the pending user is moved to the real User collection.
 */
const pendingUserSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true, 
    lowercase: true 
  },
  password: { 
    type: String, 
    required: true 
    // Note: stored as plain text here, hashed when moved to User model via User.create()
  },
  otp: { 
    type: String, 
    required: true 
  },
  otpExpires: { 
    type: Date, 
    required: true 
  },
  attempts: { 
    type: Number, 
    default: 0 
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    expires: 600 // TTL: automatically delete after 10 minutes (600 seconds)
  }
});

export default mongoose.model("PendingUser", pendingUserSchema);
