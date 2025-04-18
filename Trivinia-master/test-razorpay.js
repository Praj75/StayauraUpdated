require("dotenv").config();
const Razorpay = require('razorpay');

console.log('Testing Razorpay API keys...');
console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID);
console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? '***' : 'Not set');

try {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        console.error('Razorpay keys not found in environment variables');
        process.exit(1);
    }
    
    // Create Razorpay instance
    const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    
    // Test the Razorpay connection
    razorpay.orders.all({ count: 1 })
        .then(response => {
            console.log('Razorpay connection successful');
            console.log('Response:', response);
            process.exit(0);
        })
        .catch(error => {
            console.error('Razorpay connection failed:', error.message || 'Unknown error');
            console.error('Error details:', error);
            process.exit(1);
        });
} catch (error) {
    console.error('Razorpay initialization error:', error.message || 'Unknown error');
    console.error('Error details:', error);
    process.exit(1);
} 