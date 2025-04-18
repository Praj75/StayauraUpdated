const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    listing: {
        type: Schema.Types.ObjectId,
        ref: 'Listing',
        required: true
    },
    checkIn: {
        type: Date,
        required: true
    },
    checkOut: {
        type: Date,
        required: true
    },
    guests: {
        type: Number,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    paymentMode: {
        type: String,
        enum: ['razorpay', 'cash', 'mock'],
        required: true
    },
    bookingId: {
        type: String,
        required: true,
        unique: true
    },
    orderId: String,
    paymentId: String,
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'refunded', 'partially_refunded'],
        default: 'pending'
    },
    refundAmount: {
        type: Number,
        default: 0
    },
    contact: {
        name: String,
        email: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Method to calculate refund amount based on cancellation policy
bookingSchema.methods.calculateRefund = function() {
    const now = new Date();
    const checkIn = new Date(this.checkIn);
    const daysUntilCheckIn = Math.ceil((checkIn - now) / (1000 * 60 * 60 * 24));

    // Full refund if cancelled more than 7 days before check-in
    if (daysUntilCheckIn > 7) {
        return this.totalAmount;
    }
    // 50% refund if cancelled between 3-7 days before check-in
    else if (daysUntilCheckIn >= 3) {
        return this.totalAmount * 0.5;
    }
    // No refund if cancelled less than 3 days before check-in
    return 0;
};

// Generate booking ID before saving
bookingSchema.pre('save', async function(next) {
    // Only generate bookingId if it's not already set
    if (!this.bookingId) {
        const timestamp = Date.now().toString();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        this.bookingId = `BK${timestamp}${random}`;
    }
    
    // Ensure orderId is set if not provided
    if (!this.orderId && this.bookingId) {
        this.orderId = `ORD-${this.bookingId}`;
    }
    
    // Ensure paymentId is set if not provided
    if (!this.paymentId && this.bookingId) {
        this.paymentId = `PAY-${this.bookingId}`;
    }
    
    next();
});

module.exports = mongoose.model('Booking', bookingSchema); 