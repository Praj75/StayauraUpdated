const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');

// Create email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
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

/**
 * Send an email using a template
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.template - Template name (without .ejs extension)
 * @param {Object} options.context - Data to pass to the template
 * @returns {Promise}
 */
async function sendEmail({ to, subject, template, context }) {
    try {
        // Render email template
        const templatePath = path.join(__dirname, '..', 'views', 'emails', `${template}.ejs`);
        const html = await ejs.renderFile(templatePath, {
            ...context,
            baseUrl: process.env.BASE_URL || 'http://localhost:3000',
            logoUrl: `${process.env.BASE_URL || 'http://localhost:3000'}/images/logo.png`
        });

        // Send email
        const info = await transporter.sendMail({
            from: `"DART Bookings" <${process.env.EMAIL_USER}>`,
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

module.exports = {
    sendEmail,
    transporter
}; 