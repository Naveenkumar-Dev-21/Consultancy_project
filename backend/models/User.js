import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Optional - not required for Google auth
  googleId: { type: String, sparse: true, unique: true }, // Sparse allows null/undefined to not be unique
  picture: { type: String }, // Google profile picture
  authProvider: { 
    type: String, 
    enum: ['local', 'google', 'both'], 
    default: 'local' 
  }, // Track authentication method
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

// Hash password before saving (only if password is modified)
userSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) {
    return;
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// Method to compare password
userSchema.methods.matchPassword = function (enteredPassword) {
  if (!this.password) {
    return false; // User has no password (Google-only auth)
  }
  return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);