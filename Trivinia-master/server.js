const app = require('./app');
const mongoose = require('mongoose');
require('dotenv').config();

const port = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('\x1b[32m✅ Database connected successfully\x1b[0m');
        
        // Start server
        app.listen(port, () => {
            console.log(`\x1b[32m🚀 Server running on port ${port}\x1b[0m`);
            console.log(`\x1b[36m📝 API Documentation available at http://localhost:${port}/api-docs\x1b[0m`);
            console.log('\x1b[33m📊 Activity logging is active. Monitoring user actions...\x1b[0m');
        });
    })
    .catch(err => {
        console.error('\x1b[31m❌ Database connection error:', err, '\x1b[0m');
        process.exit(1);
    });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('\x1b[31m❌ Unhandled Promise Rejection:', err, '\x1b[0m');
    process.exit(1);
});

// Handle process termination
process.on('SIGINT', () => {
    console.log('\x1b[33m⚠️ Server shutting down...\x1b[0m');
    mongoose.connection.close(() => {
        console.log('\x1b[32m✅ Database connection closed\x1b[0m');
        process.exit(0);
    });
}); 