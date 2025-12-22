import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// /home/naveen/Consultancy_project/backend/models/users.js
'use strict';


const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'please_change_this_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const userSchema = new mongoose.Schema(
    {
        name: { type: String, trim: true, required: true },
        email: { type: String, trim: true, required: true, unique: true, lowercase: true },
        password: { type: String, required: function () { return !this.googleId; }, select: false },
        googleId: { type: String, index: true, sparse: true },
        provider: { type: String, enum: ['local', 'google'], default: 'local' },
        avatar: { type: String },
    },
    { timestamps: true }
);

// Hash password before save when modified
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        this.password = await bcrypt.hash(this.password, salt);
        return next();
    } catch (err) {
        return next(err);
    }
});

// Instance: compare raw password with hashed
userSchema.methods.comparePassword = async function (candidate) {
    if (!this.password) return false;
    return bcrypt.compare(candidate, this.password);
};

// Instance: generate JWT
userSchema.methods.generateJWT = function () {
    const payload = { id: this._id, email: this.email, name: this.name };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Static: register a new local user
userSchema.statics.register = async function ({ name, email, password, avatar }) {
    const User = this;
    const existing = await User.findOne({ email });
    if (existing) {
        throw new Error('Email already in use');
    }
    const user = new User({ name, email, password, avatar, provider: 'local' });
    await user.save();
    return user;
};

// Static: authenticate local login
userSchema.statics.authenticate = async function ({ email, password }) {
    const User = this;
    const user = await User.findOne({ email }).select('+password');
    if (!user) throw new Error('Invalid credentials');
    const match = await user.comparePassword(password);
    if (!match) throw new Error('Invalid credentials');
    return user;
};

// Static: find or create user from Google profile
// googleProfile expected shape: { id, displayName, emails: [{value}], photos: [{value}] }
userSchema.statics.findOrCreateGoogle = async function (googleProfile) {
    const User = this;
    const googleId = googleProfile.id;
    const email = (googleProfile.emails && googleProfile.emails[0] && googleProfile.emails[0].value) || null;
    const name = googleProfile.displayName || (email ? email.split('@')[0] : 'Google User');
    const avatar = (googleProfile.photos && googleProfile.photos[0] && googleProfile.photos[0].value) || null;

    // Prefer finding by googleId first
    let user = null;
    if (googleId) {
        user = await User.findOne({ googleId });
    }

    // Fallback: find by email (user may have signed up locally before)
    if (!user && email) {
        user = await User.findOne({ email });
        if (user) {
            // link googleId if not set
            user.googleId = googleId;
            user.provider = 'google';
            if (!user.avatar && avatar) user.avatar = avatar;
            await user.save();
            return user;
        }
    }

    if (user) return user;

    // Create a new user
    const randomPassword = Math.random().toString(36).slice(-12);
    const newUser = new User({
        name,
        email: email || `no-email-${Date.now()}@example.com`,
        password: randomPassword,
        googleId,
        provider: 'google',
        avatar,
    });

    await newUser.save();
    return newUser;
};

export default mongoose.model('User', userSchema);