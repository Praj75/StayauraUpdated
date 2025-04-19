const Booking = require('../models/booking');
const Listing = require('../models/listing');
const User = require('../models/user');
const nodemailer = require('nodemailer');
const puppeteer = require('puppeteer');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');
const ejs = require('ejs');

// Email transporter setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Generate PDF receipt
const generateReceipt = async (booking) => {
    try {
        // Generate QR code
        const qrCodeData = `Booking ID: ${booking._id}\nProperty: ${booking.listing.title}\nCheck-in: ${booking.checkIn}\nCheck-out: ${booking.checkOut}`;
        const qrCodePath = path.join(__dirname, '../public/qrcodes', `${booking._id}.png`);
        await QRCode.toFile(qrCodePath, qrCodeData);

        // Read the template
        const templatePath = path.join(__dirname, '../views/receipts/booking-receipt.ejs');
        const template = fs.readFileSync(templatePath, 'utf8');

        // Render the template with booking data
        const html = ejs.render(template, {
            booking,
            qrCodePath: `/qrcodes/${booking._id}.png`
        });

        // Generate PDF using Puppeteer
        const pdfPath = path.join(__dirname, '../public/receipts', `${booking._id}.pdf`);
        
        // Launch a headless browser
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();
        
        // Set content and wait for rendering
        await page.setContent(html, { waitUntil: 'networkidle0' });
        
        // Generate PDF
        await page.pdf({
            path: pdfPath,
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20px',
                right: '20px',
                bottom: '20px',
                left: '20px'
            }
        });
        
        // Close the browser
        await browser.close();

        return pdfPath;
    } catch (error) {
        console.error('Error generating receipt:', error);
        throw error;
    }
};

// Send confirmation emails
const sendConfirmationEmails = async (booking) => {
    try {
        // Get user and host details
        const user = await User.findById(booking.user);
        const host = await User.findById(booking.listing.author);
        const listing = await Listing.findById(booking.listing);

        // Generate PDF receipt
        const receiptPath = await generateReceipt(booking);

        // Send email to guest
        const guestEmailContext = {
            guestName: user.username,
            hostName: host.username,
            listingTitle: listing.title,
            checkInDate: booking.checkIn,
            checkOutDate: booking.checkOut,
            totalPrice: (booking.amount.total / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR' }),
            bookingId: booking._id
        };

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Booking Confirmation',
            html: ejs.render(fs.readFileSync(path.join(__dirname, '../views/emails/booking-confirmation.ejs'), 'utf8'), guestEmailContext),
            attachments: [{
                filename: 'booking-receipt.pdf',
                path: receiptPath
            }]
        });

        // Send email to host
        const hostEmailContext = {
            hostName: host.username,
            guestName: user.username,
            guestEmail: user.email,
            guestPhone: user.phone,
            listingTitle: listing.title,
            checkInDate: booking.checkIn,
            checkOutDate: booking.checkOut,
            totalPrice: (booking.amount.total / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR' }),
            bookingId: booking._id,
            numGuests: booking.guests
        };

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: host.email,
            subject: 'New Booking Notification',
            html: ejs.render(fs.readFileSync(path.join(__dirname, '../views/emails/host-notification.ejs'), 'utf8'), hostEmailContext)
        });

        // Clean up temporary files
        fs.unlinkSync(receiptPath);
        fs.unlinkSync(path.join(__dirname, '../public/qrcodes', `${booking._id}.png`));
    } catch (error) {
        console.error('Error sending confirmation emails:', error);
        throw error;
    }
};

// Create booking
module.exports.createBooking = async (req, res) => {
    try {
        const { listingId, checkIn, checkOut, guests, paymentMode, paymentId } = req.body;
        
        // Get listing details
        const listing = await Listing.findById(listingId);
        if (!listing) {
            req.flash('error', 'Listing not found');
            return res.redirect('back');
        }

        // Check guest limit
        if (guests > listing.maxGuests) {
            req.flash('error', `Maximum ${listing.maxGuests} guests allowed`);
            return res.redirect('back');
        }

        // Calculate amount
        const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
        const totalAmount = listing.price * nights;

        // Create booking
        const booking = new Booking({
            listing: listingId,
            user: req.user._id,
            checkIn,
            checkOut,
            guests,
            paymentMode,
            paymentId,
            totalAmount,
            contact: {
                email: req.user.email,
                name: req.user.username
            }
        });

        await booking.save();

        // Send notifications
        const host = await User.findById(listing.author);
        const guest = await User.findById(req.user._id);

        // Send email to host
        const hostEmail = {
            to: host.email,
            subject: 'New Booking Received',
            text: `You have received a new booking from ${guest.username} for ${listing.title}. 
                   Booking ID: ${booking.bookingId}
                   Check-in: ${checkIn}
                   Check-out: ${checkOut}
                   Guests: ${guests}
                   Total Amount: ₹${totalAmount}`
        };

        // Send email to guest
        const guestEmail = {
            to: guest.email,
            subject: 'Booking Confirmation',
            text: `Your booking has been confirmed for ${listing.title}.
                   Booking ID: ${booking.bookingId}
                   Check-in: ${checkIn}
                   Check-out: ${checkOut}
                   Guests: ${guests}
                   Total Amount: ₹${totalAmount}`
        };

        // Send emails
        await sendEmail(hostEmail);
        await sendEmail(guestEmail);

        req.flash('success', 'Booking confirmed successfully!');
        res.redirect(`/bookings/${booking._id}`);
    } catch (error) {
        console.error('Error creating booking:', error);
        req.flash('error', 'Failed to create booking');
        res.redirect('back');
    }
};

// Cancel booking
module.exports.cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        
        const booking = await Booking.findById(id)
            .populate('listing')
            .populate('user');
            
        if (!booking) {
            req.flash('error', 'Booking not found');
            return res.redirect('back');
        }

        // Check if user is authorized (either the guest or the host)
        const isGuest = booking.user._id.equals(req.user._id);
        const isHost = booking.listing.author.equals(req.user._id);
        
        if (!isGuest && !isHost) {
            req.flash('error', 'You are not authorized to cancel this booking');
            return res.redirect('back');
        }

        // Update booking status
        booking.status = 'cancelled';
        booking.cancellationReason = reason;
        booking.cancelledBy = isGuest ? 'user' : 'host';
        await booking.save();

        // Remove booked dates from listing
        const listing = await Listing.findById(booking.listing._id);
        await listing.removeBookedDates(booking._id);

        // Send cancellation emails
        const host = await User.findById(booking.listing.author);
        const guest = booking.user;

        const cancellationEmail = {
            subject: 'Booking Cancellation',
            text: `Your booking for ${booking.listing.title} has been cancelled.
                   Booking ID: ${booking.bookingId}
                   Cancelled by: ${booking.cancelledBy}
                   Reason: ${reason || 'No reason provided'}`
        };

        // Send to both parties
        await sendEmail({ ...cancellationEmail, to: host.email });
        await sendEmail({ ...cancellationEmail, to: guest.email });

        req.flash('success', 'Booking cancelled successfully');
        res.redirect('/bookings');
    } catch (error) {
        console.error('Error cancelling booking:', error);
        req.flash('error', 'Failed to cancel booking');
        res.redirect('back');
    }
}; 