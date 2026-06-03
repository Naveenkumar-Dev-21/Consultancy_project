import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Please provide a name'], trim: true },
  email: { 
    type: String, 
    required: [true, 'Please provide an email'], 
    unique: true, 
    trim: true, 
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  password: { type: String, minlength: [6, 'Password must be at least 6 characters'] },
  googleId: { type: String, sparse: true, unique: true },
  picture: { type: String },
  authProvider: { 
    type: String, 
    enum: ['local', 'google', 'both'], 
    default: 'local' 
  },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  address: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    postalCode: { type: String, default: '' },
    country: { type: String, default: '' },
    phone: { type: String, default: '' }
  },
  babyDetails: {
    name: { type: String, default: '' },
    gender: { type: String, default: '' },
    age: { type: String, default: '' },
    weight: { type: String, default: '' },
    size: { type: String, default: '' }
  }
}, { timestamps: true });

// Hash password before saving
userSchema.pre("save", async function () {
  // Skip if password hasn't changed, is empty, or was pre-hashed (from PendingUser promotion)
  if (!this.isModified("password") || !this.password || this.$skipPasswordHash) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
userSchema.methods.matchPassword = function (enteredPassword) {
  if (!this.password) {
    return false; // User has no password (Google-only auth)
  }
  return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);