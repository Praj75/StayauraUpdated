const express = require('express');
const router = express.Router();
const Listing = require('../models/listing');
const Booking = require('../models/booking');

// Search listings based on criteria
router.post('/search', async (req, res) => {
    try {
        const { propertyType, location, dates, guests } = req.body;
        
        // Build search query
        const query = {};
        
        if (propertyType) {
            query.category = propertyType;
        }
        
        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }
        
        if (guests) {
            query.maxGuests = { $gte: parseInt(guests) };
        }
        
        // Find listings matching criteria
        const listings = await Listing.find(query).limit(5);
        
        res.json({ success: true, listings });
    } catch (error) {
        console.error('Chatbot search error:', error);
        res.status(500).json({ success: false, error: 'Failed to search listings' });
    }
});

// Check booking status
router.post('/check-booking', async (req, res) => {
    try {
        const { bookingId } = req.body;
        
        // Find booking by ID
        const booking = await Booking.findById(bookingId)
            .populate('listing')
            .populate('user');
            
        if (!booking) {
            return res.json({ success: false, message: 'Booking not found' });
        }
        
        res.json({ success: true, booking });
    } catch (error) {
        console.error('Chatbot booking check error:', error);
        res.status(500).json({ success: false, error: 'Failed to check booking' });
    }
});

// Get property details
router.get('/property/:id', async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        
        if (!listing) {
            return res.json({ success: false, message: 'Property not found' });
        }
        
        res.json({ success: true, listing });
    } catch (error) {
        console.error('Chatbot property details error:', error);
        res.status(500).json({ success: false, error: 'Failed to get property details' });
    }
});

module.exports = router; 