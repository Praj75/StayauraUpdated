const mongoose = require("mongoose");
const Review = require('./review');
const Schema = mongoose.Schema;

const bookedDatesSchema = new Schema({
    checkIn: {
        type: Date,
        required: function() {
            return this.bookingId != null;
        },
        get: (date) => date ? new Date(date) : null,
        set: (date) => date ? new Date(date) : null
    },
    checkOut: {
        type: Date,
        required: function() {
            return this.bookingId != null;
        },
        get: (date) => date ? new Date(date) : null,
        set: (date) => date ? new Date(date) : null
    },
    bookingId: {
        type: Schema.Types.ObjectId,
        ref: 'Booking'
    }
});

const reviewSchema = new Schema({
    comment: String,
    rating: Number,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    date: {
        type: Date,
        default: Date.now
    },
    reply: String,
    replyDate: Date
});

const listingSchema = new Schema({
    title: {
        type: String,
        required: true 
    },
    description: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    country: String, 
    price: {
        type: Number,
        required: true, 
        min: 0 
    },
    images: [{
        url: String,
        filename: String
    }],
    geometry: {
        type: {
            type: String,
            enum: ["Point"],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    availability: [{
        checkIn: Date,
        checkOut: Date
    }],
    category: {
        type: String,
        enum: ['beach', 'mountain', 'city', 'lake', 'trending', 'countryside', 'mansion'],
        required: true
    },
    amenities: {
        beds: {
            type: Number,
            required: true,
            min: 1
        },
        baths: {
            type: Number,
            required: true,
            min: 1
        },
        guests: {
            type: Number,
            required: true,
            min: 1
        }
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }],
    bookedDates: [{
        checkIn: Date,
        checkOut: Date,
        bookingId: {
            type: Schema.Types.ObjectId,
            ref: 'Booking'
        }
    }],
    maxGuests: {
        type: Number,
        default: 10
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Delete all associated reviews when a listing is deleted
listingSchema.post('findOneAndDelete', async function(listing) {
    if (listing.reviews.length) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});

// Virtual property for average rating
listingSchema.virtual('rating').get(function() {
    if (this.reviews.length === 0) return 0;
    const sum = this.reviews.reduce((total, review) => total + review.rating, 0);
    return (sum / this.reviews.length).toFixed(1);
});

// Method to check if dates are available
listingSchema.methods.isAvailable = function(checkIn, checkOut, excludeBookingId = null) {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Check if any booked dates overlap with the requested dates
    return !this.bookedDates.some(booking => {
        // Skip the booking we're excluding (useful for updates)
        if (excludeBookingId && booking.bookingId && booking.bookingId.equals(excludeBookingId)) {
            return false;
        }

        const bookedCheckIn = new Date(booking.checkIn);
        const bookedCheckOut = new Date(booking.checkOut);

        // Check for date overlap
        return (checkInDate <= bookedCheckOut && checkOutDate >= bookedCheckIn);
    });
};

// Method to add booked dates
listingSchema.methods.addBookedDates = async function(checkIn, checkOut, bookingId) {
    try {
        // Create the booked dates object with proper date formatting
        const bookedDate = {
            checkIn: new Date(checkIn),
            checkOut: new Date(checkOut),
            bookingId: bookingId
        };
        
        // Add to the bookedDates array
        this.bookedDates.push(bookedDate);
        
        // Save the listing with validation
        await this.save({ validateBeforeSave: true });
    } catch (error) {
        console.error('Error in addBookedDates:', error);
        throw error;
    }
};

// Method to remove booked dates
listingSchema.methods.removeBookedDates = async function(bookingId) {
    this.bookedDates = this.bookedDates.filter(date => 
        !(date.bookingId && date.bookingId.equals(bookingId))
    );
    await this.save();
};

module.exports = mongoose.model("Listing", listingSchema);