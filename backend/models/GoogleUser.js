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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const GoogleUser = mongoose.model('GoogleUser', GoogleUserSchema);
export default GoogleUser;
