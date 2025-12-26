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
  role:{
    type:String,
    enum:['user','admin'],
    default:'user'
  }
});

const GoogleUser = mongoose.model('GoogleUser', GoogleUserSchema);
export default GoogleUser;
