const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');

// Create email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Verify email configuration on startup (only once)
let isVerified = false;

async function verifyTransporter() {
    if (!isVerified) {
        try {
            await transporter.verify();
            isVerified = true;
        } catch (error) {
            console.error('❌ Email configuration error:', error);
        }
    }
}

verifyTransporter();

// Helper functions
const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
};

/**
 * Send an email using a template
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.template - Template name (without .ejs extension)
 * @param {Object} options.data - Data to pass to the template
 */
async function sendTemplateEmail({ to, subject, template, data }) {
    try {
        const templatePath = path.join(__dirname, '..', 'views', 'emails', `${template}.ejs`);
        const html = await ejs.renderFile(templatePath, {
            ...data,
            formatDate,
            formatCurrency,
            baseUrl: process.env.BASE_URL || 'http://localhost:3000'
        });

        const info = await transporter.sendMail({
            from: `"Trivinia" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        });

        console.log('✅ Email sent successfully:', info.messageId);
        return info;
    } catch (error) {
        console.error('❌ Error sending email:', error);
        throw error;
    }
}

/**
 * Send booking confirmation emails to both guest and host
 * @param {Object} booking - The booking object with populated guest, listing, and owner
 */
async function sendBookingConfirmationEmail(booking) {
    try {
        // Send confirmation to guest
        await sendTemplateEmail({
            to: booking.guest.email,
            subject: 'Booking Confirmation - Trivinia',
            template: 'bookingConfirmationGuest',
            data: { booking }
        });

        // Send notification to host
        await sendTemplateEmail({
            to: booking.listing.owner.email,
            subject: 'New Booking Notification - Trivinia',
            template: 'bookingConfirmationHost',
            data: { booking }
        });

        console.log('✅ Booking confirmation emails sent successfully');
    } catch (error) {
        console.error('❌ Error sending booking confirmation emails:', error);
        throw error;
    }
}

module.exports = {
    transporter,
    sendTemplateEmail,
    sendBookingConfirmationEmail
}; 