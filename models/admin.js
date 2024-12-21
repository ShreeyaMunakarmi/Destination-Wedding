import mongoose from 'mongoose';

const AdminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: 'admin',
    },
    contact_details: {
      type: String,
      required: [true, 'Contact Details is required'],
    },
  },
  { timestamps: true }
);

// Check if the model already exists before defining it
const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

export default Admin;
