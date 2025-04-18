const path = require('path');
const fs = require('fs').promises;

const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const ejs = require('ejs');
const puppeteer = require('puppeteer');
const { check, validationResult } = require('express-validator');
const Listing = require('../models/listing');
const Booking = require('../models/booking');
const { ExpressError } = require('../utils/ExpressError');
const wrapAsync = require('../utils/wrapAsync');
const { sendEmail, transporter } = require('../utils/email');
const User = require('../models/users');
const { isLoggedIn } = require('../middleware');

// Remove mock payment flag
const USE_MOCK_PAYMENT = false;

/**
 * Check if the given dates are available for a listing
 * @param {Object} listing - The listing object
 * @param {string} checkIn - Check-in date (ISO string)
 * @param {string} checkOut - Check-out date (ISO string)
 * @returns {Promise<boolean>} - Whether the dates are available
 */
async function checkDateAvailability(listing, checkIn, checkOut) {
    try {
        // Convert dates to Date objects
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        
        // Validate dates
        if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
            return false;
        }
        
        // Check if check-out is after check-in
        if (checkOutDate <= checkInDate) {
            return false;
        }
        
        // Check if dates are in the past
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (checkInDate < today) {
            return false;
        }
        
        // Check if listing has bookedDates array
        if (!listing.bookedDates || !Array.isArray(listing.bookedDates)) {
            return true;
        }
        
        // Check for overlapping bookings
        for (const booking of listing.bookedDates) {
            const bookingStart = new Date(booking.checkIn);
            const bookingEnd = new Date(booking.checkOut);
            
            // Check for overlap
            if (
                (checkInDate >= bookingStart && checkInDate < bookingEnd) ||
                (checkOutDate > bookingStart && checkOutDate <= bookingEnd) ||
                (checkInDate <= bookingStart && checkOutDate >= bookingEnd)
            ) {
                return false;
            }
        }
        
        return true;
    } catch (error) {
        return false;
    }
}

// Initialize Razorpay with error handling
let razorpay;
try {
    // Check if environment variables are loaded
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        console.error('Razorpay keys not found in environment variables');
        throw new Error('Razorpay keys not configured');
    }
    
    // Create Razorpay instance
    razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    
    // Test the Razorpay connection
    razorpay.orders.all({ count: 1 })
        .then(response => {
            // Connection successful
            console.log('Razorpay connection successful');
        })
        .catch(error => {
            // Connection failed
            console.error('Razorpay connection failed:', error.message || 'Unknown error');
            if (error.statusCode === 401) {
                console.error('Authentication failed. Please check your API keys.');
            }
            razorpay = null;
        });
    
} catch (error) {
    console.error('Razorpay initialization error:', error.message || 'Unknown error');
    razorpay = null;
}

// Verify email configuration
transporter.verify(function (error, success) {
    if (error) {
        console.error('❌ Email configuration error:', error);
    } else {
        console.log('✅ Email server is ready to send messages');
    }
});

// 🔑 Get Razorpay Key
router.get("/getRazorPayKey", (req, res) => {
    if (USE_MOCK_PAYMENT || !process.env.RAZORPAY_KEY_ID) {
        // Return a mock key that won't try to make real API calls
        res.json({ key: 'rzp_test_mock', mock: true });
    } else {
        res.json({ key: process.env.RAZORPAY_KEY_ID });
    }
});

// Create order endpoint
router.post('/create-order', isLoggedIn, async (req, res) => {
    try {
        const { listingId, checkIn, checkOut, guests, totalPrice } = req.body;
        
        // Validate required fields
        if (!listingId || !checkIn || !checkOut || !guests || !totalPrice) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Find the listing
        const listing = await Listing.findById(listingId);
        if (!listing) {
            return res.status(404).json({ error: 'Listing not found' });
        }

        // Check if dates are available
        const isAvailable = await checkDateAvailability(listing, checkIn, checkOut);
        if (!isAvailable) {
            return res.status(400).json({ error: 'Selected dates are not available' });
        }

        // Check if Razorpay is properly initialized
        if (!razorpay) {
            return res.status(500).json({ 
                error: 'Payment service is not configured properly. Please contact support.',
                details: 'Razorpay initialization failed. Please check your API keys in the .env file. The keys may be invalid or expired.'
            });
        }

        // Create Razorpay order
        const order = await razorpay.orders.create({
            amount: totalPrice * 100, // Convert to paise
            currency: 'INR',
            receipt: `receipt_${Date.now()}`
        });

        res.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        // Provide more detailed error message to the client
        if (error.statusCode === 401) {
            return res.status(500).json({ 
                error: 'Payment service authentication failed. Please contact support.',
                details: 'Invalid Razorpay API keys. The keys may be invalid or expired. Please check your key_id and key_secret in the .env file.'
            });
        }
        
        res.status(500).json({ 
            error: 'Failed to create order',
            details: error.message || 'Unknown error occurred'
        });
    }
});

// 💾 Store payment + booking in session
router.post("/store-payment-details", async (req, res) => {
    try {
        const { paymentDetails, bookingDetails, email, receiptFileName } = req.body;

        if (!paymentDetails || !bookingDetails) {
            return res.status(400).json({ error: 'Missing payment or booking details' });
        }

        // Merge new data with existing session data
            req.session.paymentDetails = {
                ...req.session.paymentDetails,
                ...paymentDetails
            };
            req.session.bookingDetails = {
                ...req.session.bookingDetails,
                ...bookingDetails
            };
        if (email) req.session.email = email;
        if (receiptFileName) req.session.receiptFileName = receiptFileName;

        await new Promise((resolve, reject) => {
            req.session.save((err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        res.json({ success: true });
    } catch (error) {
        console.error("Error storing session data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 🧾 Generate PDF Receipt
async function generateReceipt(paymentDetails, bookingDetails, receiptFileName) {
    try {
        const templatePath = path.join(__dirname, '..', 'views', 'receipt.ejs');
        const template = await fs.readFile(templatePath, 'utf-8');
        const html = ejs.render(template, { 
            paymentDetails, 
            bookingDetails,
            formatDate: (date) => new Date(date).toLocaleDateString(),
            formatCurrency: (amount) => `₹${(amount/100).toLocaleString('en-IN')}`
        });

        const browser = await puppeteer.launch({ 
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setContent(html);

        const receiptDir = path.join(__dirname, '..', 'temp', 'receipts');
        await fs.mkdir(receiptDir, { recursive: true });

        const receiptPath = path.join(receiptDir, receiptFileName);
        await page.pdf({ 
            path: receiptPath, 
            format: 'A4',
            printBackground: true,
            margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
        });

        await browser.close();
        return receiptPath;
    } catch (error) {
        console.error("Error generating receipt:", error);
        throw error;
    }
}

// 📧 Send Booking Confirmation Email
async function sendBookingConfirmation(email, emailData, paymentDetails, receiptPath) {
    try {
        // Read and compile email template
        const templatePath = path.join(__dirname, '..', 'views', 'emails', 'bookingConfirmation.ejs');
        const emailTemplate = await fs.readFile(templatePath, 'utf-8');
        const html = ejs.render(emailTemplate, emailData);

        const mailOptions = {
            from: `"DART Bookings" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Your Booking is Confirmed! - DART",
            html: html,
            attachments: receiptPath ? [
                {
                    filename: 'booking-receipt.pdf',
                    path: receiptPath
                }
            ] : []
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Booking confirmation email sent:", info.messageId);
        
        // Clean up receipt file after sending
        if (receiptPath) {
            await fs.unlink(receiptPath).catch(err => 
                console.error("Warning: Could not delete receipt file:", err)
            );
        }
    } catch (error) {
        console.error("❌ Error sending booking confirmation:", error);
        throw error;
    }
}

// 📧 Send Host Notification
async function sendHostNotification(hostEmail, emailData, paymentDetails) {
    try {
        // Read and compile email template
        const templatePath = path.join(__dirname, '..', 'views', 'emails', 'hostNotification.ejs');
        const emailTemplate = await fs.readFile(templatePath, 'utf-8');
        const html = ejs.render(emailTemplate, emailData);

        const mailOptions = {
            from: `"DART Bookings" <${process.env.EMAIL_USER}>`,
            to: hostEmail,
            subject: "New Booking Received! - DART",
            html: html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Host notification sent:", info.messageId);
    } catch (error) {
        console.error("❌ Error sending host notification:", error);
        throw error;
    }
}

// 📧 Send Booking Confirmation Emails
async function sendBookingConfirmationEmails(booking, listing, user, host) {
    try {
        // Prepare email data
        const emailData = {
            guestName: user.username,
            listingTitle: listing.title,
            checkIn: booking.checkIn,
            checkOut: booking.checkOut,
            totalPrice: booking.totalAmount,
            bookingId: booking._id,
            orderId: booking.orderId,
            paymentId: booking.paymentId,
            paymentMode: booking.paymentMode,
            status: booking.status,
            hostName: host.username
        };

        // Send confirmation email to guest
        await sendBookingConfirmation(user.email, emailData, booking);

        // Send notification to host
        await sendHostNotification(host.email, {
            hostName: host.username,
            guestName: user.username,
            title: listing.title,
            checkIn: new Date(booking.checkIn).toLocaleDateString('en-US', { 
                weekday: 'short', 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            }),
            checkOut: new Date(booking.checkOut).toLocaleDateString('en-US', { 
                weekday: 'short', 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            }),
            amount: booking.totalAmount,
            bookingId: booking._id,
            orderId: booking.orderId,
            paymentId: booking.paymentId,
            status: booking.status
        });

        console.log('✅ Booking confirmation emails sent successfully');
    } catch (error) {
        console.error('❌ Error sending booking confirmation emails:', error);
        // Don't throw the error, just log it
        // This way the booking process can continue even if email fails
    }
}

// Payment Success Route
router.post('/payment-success', isLoggedIn, async (req, res) => {
    try {
        const { 
            razorpay_payment_id, 
            razorpay_order_id, 
            razorpay_signature,
            listingId,
            checkIn,
            checkOut,
            guests,
            totalPrice
        } = req.body;

        // Validate required fields
        if (!listingId || !checkIn || !checkOut || !guests || !totalPrice || !razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Verify Razorpay signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ error: 'Invalid payment signature' });
        }

        // Find the listing
        const listing = await Listing.findById(listingId);
        if (!listing) {
            return res.status(404).json({ error: 'Listing not found' });
        }

        // Create booking
        const booking = new Booking({
            user: req.user._id,
            author: req.user._id,
            listing: listingId,
            checkIn,
            checkOut,
            guests,
            totalAmount: totalPrice,
            paymentMode: 'razorpay',
            bookingId: razorpay_payment_id,
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            status: 'confirmed',
            paymentStatus: 'paid'
        });

        // Save booking
        await booking.save();

        // Update listing's bookedDates
        listing.bookedDates.push({
            bookingId: booking._id,
            checkIn,
            checkOut
        });
        await listing.save();

        // Send confirmation emails
        try {
            const user = await User.findById(req.user._id);
            const host = await User.findById(listing.owner);
            
            // Prepare email data
            const emailData = {
                guestName: user.username,
                listingTitle: listing.title,
                checkIn: booking.checkIn,
                checkOut: booking.checkOut,
                totalPrice: booking.totalAmount,
                bookingId: booking._id,
                orderId: booking.orderId,
                paymentId: booking.paymentId,
                paymentMode: booking.paymentMode,
                status: booking.status,
                hostName: host.username
            };

            // Send confirmation email to guest
            await sendBookingConfirmation(user.email, emailData, booking);

            // Send notification to host
            await sendHostNotification(host.email, {
                hostName: host.username,
                guestName: user.username,
                title: listing.title,
                checkIn: new Date(booking.checkIn).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                }),
                checkOut: new Date(booking.checkOut).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                }),
                amount: booking.totalAmount,
                bookingId: booking._id,
                orderId: booking.orderId,
                paymentId: booking.paymentId,
                status: booking.status
            });
        } catch (emailError) {
            // Log email error but don't fail the booking
            console.error('Failed to send confirmation emails:', emailError);
        }

        res.json({
            success: true,
            message: 'Booking confirmed successfully',
            bookingId: booking._id,
            redirectUrl: '/bookings'
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to process booking' });
    }
});

// Handle booking cancellation and refund
router.post('/cancel-booking', isLoggedIn, async (req, res) => {
    try {
        const { bookingId } = req.body;
        
        if (!bookingId) {
            return res.status(400).json({ error: 'Booking ID is required' });
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        // Check if user is authorized to cancel
        if (booking.user.toString() !== req.user._id.toString() && 
            booking.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to cancel this booking' });
        }

        // Calculate refund amount
        const refundAmount = booking.totalAmount;

        // Process refund through Razorpay
        try {
            const refund = await razorpay.payments.refund(booking.paymentId, {
                amount: refundAmount * 100 // Convert to paise
            });
            booking.refundId = refund.id;
        } catch (error) {
            return res.status(500).json({ error: 'Failed to process refund' });
        }

        // Update booking status
        booking.status = 'cancelled';
        await booking.save();

        // Remove booking from listing's bookedDates
        const listing = await Listing.findById(booking.listing);
        if (listing) {
            listing.bookedDates = listing.bookedDates.filter(date => 
                date.checkIn.toString() !== booking.checkIn.toString() ||
                date.checkOut.toString() !== booking.checkOut.toString()
            );
            await listing.save();
        }

        // Send cancellation notifications
        try {
            const user = await User.findById(booking.user);
            const host = await User.findById(listing.owner);

            // Send cancellation email to guest
            await sendBookingConfirmation(user.email, {
                guestName: user.username,
                listingTitle: listing.title,
                checkIn: booking.checkIn,
                checkOut: booking.checkOut,
                totalPrice: booking.totalAmount,
                bookingId: booking._id,
                orderId: booking.orderId,
                paymentId: booking.paymentId,
                refundId: booking.refundId,
                status: 'cancelled',
                type: 'cancellation'
            });

            // Send cancellation notification to host
            await sendHostNotification(host.email, {
                hostName: host.username,
                guestName: user.username,
                title: listing.title,
                checkIn: new Date(booking.checkIn).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                }),
                checkOut: new Date(booking.checkOut).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                }),
                amount: booking.totalAmount,
                bookingId: booking._id,
                orderId: booking.orderId,
                paymentId: booking.paymentId,
                refundId: booking.refundId,
                status: 'cancelled',
                type: 'cancellation'
            });
        } catch (emailError) {
            // Log email error but don't fail the cancellation
            console.error('Failed to send cancellation emails:', emailError);
        }

        res.json({
            success: true,
            message: 'Booking cancelled successfully',
            bookingId: booking._id,
            refundAmount: refundAmount,
            refundId: booking.refundId
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to cancel booking' });
    }
});

module.exports = router;
