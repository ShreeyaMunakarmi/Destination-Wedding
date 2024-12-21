import mongoose from 'mongoose';

const WeddingPackageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EventManagementVendor',
      required: true,
    },
    bookings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
      },
    ],
  },
  { timestamps: true }
);

const WeddingPackage = mongoose.model('WeddingPackage', WeddingPackageSchema);

export default WeddingPackage;
