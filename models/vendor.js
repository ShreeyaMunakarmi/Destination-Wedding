import mongoose from 'mongoose';

const VendorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    service_type: {
      type: String,
      required: true,
    },
    contact_details: {
      type: String,
    },
  },
  { timestamps: true }
);

const Vendor = mongoose.model('Vendor', VendorSchema);

export default Vendor;
