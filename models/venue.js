import mongoose from 'mongoose';

const VenueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    event_management_vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EventManagementVendor',
      required: true,
    },
  },
  { timestamps: true }
);

const Venue = mongoose.model('Venue', VenueSchema);

export default Venue;
