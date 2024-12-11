const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        package_id: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'WeddingPackage', 
            required: true 
        },
        booking_date: { 
            type: Date, 
            default: Date.now 
        },
        status: { 
            type: String, default: 'Pending', enum: ['Pending', 'Confirmed', 'Cancelled'] 
        },
    }, 
    { timestamps: true }
);

module.exports = mongoose.model('Booking', BookingSchema);
