import mongoose from 'mongoose';

const GoogleUserSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  picture: {
    type: String
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
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
});

const GoogleUser = mongoose.model('GoogleUser', GoogleUserSchema);
export default GoogleUser;
