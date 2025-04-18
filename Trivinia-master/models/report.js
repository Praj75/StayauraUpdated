const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    type: {
        type: String,
        enum: ['Maintenance', 'Safety', 'Noise', 'Other'],
        required: true
    },
    description: {
        type: String,
        required: [true, 'Please provide a description of the issue'],
        minlength: [10, 'Description must be at least 10 characters long']
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Urgent'],
        default: 'Medium'
    },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Resolved', 'Closed'],
        default: 'Pending'
    },
    evidence: {
        url: String,
        filename: String
    },
    adminNotes: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
reportSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Add index for faster queries
reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ bookingId: 1 });

module.exports = mongoose.model('Report', reportSchema); 