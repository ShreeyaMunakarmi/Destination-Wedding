const mongoose = require('mongoose');

const VendorSchema = new mongoose.Schema(
    {
        name: { 
            type: String, 
            required: true 
        },
        service_type: { 
            type: String, 
            required: true 
        },
        contact_details: { 
            type: String 
        },
        
    },
     { timestamps: true }
);

module.exports = mongoose.model('Vendor', VendorSchema);
