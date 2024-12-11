const mongoose = require('mongoose');

const EventManagementVendorSchema = new mongoose.Schema(
    {
        user_id: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User', 
            required: true 
        },
        vendor_id: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Vendor', 
            required: true 
        },
        wedding_packages: [
            { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'WeddingPackage' 
            }
        ],
        venues: [
            { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'Venue' 
            }
        ],
    }, 
     { timestamps: true }
);

module.exports = mongoose.model('EventManagementVendor', EventManagementVendorSchema);
