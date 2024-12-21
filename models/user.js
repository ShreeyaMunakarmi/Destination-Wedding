import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
    },
    contact_details: {
      type: String,
      required: [true, 'Contact Details is required'],
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'eventMgmtVendor'],
      default: 'user',
    },
  },
  { timestamps: true }
);

const User = mongoose.model('User', UserSchema);

export default User;
