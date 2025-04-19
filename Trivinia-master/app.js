require("dotenv").config();
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongo");
const methodOverride = require("method-override");
const passport = require("./config/passport.js");
const flash = require("connect-flash");
const ejsMate = require("ejs-mate");
const cors = require("cors");
const cookieParser = require('cookie-parser');

const User = require('./models/users.js');
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/userRoutes.js");
const paymentRouter = require("./routes/paymentRoutes.js");
const bookingRouter = require("./routes/bookingRoutes.js");
const chatbotRoutes = require('./routes/chatbot.js');
const pagesRoutes = require('./routes/pages.js');

const app = express();

// DB Connection
mongoose.connect(process.env.ATLASDB_URL)
  .then(() => console.log("Database connected"))
  .catch((err) => console.log("Database connection error:", err));

// Middleware
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.locals.layout = false;  // Disable default layout
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// Session configuration
const store = MongoDBStore.create({
    mongoUrl: process.env.ATLASDB_URL,
    crypto: { secret: process.env.SECRET },
    touchAfter: 24 * 3600,
    autoRemove: 'interval',
    autoRemoveInterval: 10
});

store.on('error', function(error) {
    console.log('Session store error:', error);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // Extended to 7 days
    }
};

app.use(session(sessionOptions));

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());

// Configure passport to use less aggressive session handling
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id).select('_id username email');
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

// Static files middleware - should be before session middleware
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: '1d',
    etag: true,
    lastModified: true
}));

app.use(flash());

// Add cookie parser middleware
app.use(cookieParser(process.env.SECRET));

// Add logging middleware before routes
app.use((req, res, next) => {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const user = req.user ? req.user.username : 'Guest';
    const method = req.method;
    const url = req.originalUrl;
    
    let color = '\x1b[37m'; // Default white
    switch(method) {
        case 'GET': color = '\x1b[36m'; break;    // Cyan
        case 'POST': color = '\x1b[32m'; break;   // Green
        case 'DELETE': color = '\x1b[31m'; break; // Red
        case 'PUT': color = '\x1b[33m'; break;    // Yellow
    }
    
    console.log(`${color}[${timestamp}] ${method} ${url} - User: ${user}\x1b[0m`);
    
    if (['POST', 'PUT'].includes(method) && Object.keys(req.body).length > 0) {
        const sanitizedBody = JSON.parse(JSON.stringify(req.body));
        if (sanitizedBody.password) sanitizedBody.password = '[REDACTED]';
        if (sanitizedBody.email) sanitizedBody.email = '[REDACTED]';
        console.log(`\x1b[90m└─ Data: ${JSON.stringify(sanitizedBody)}\x1b[0m`);
    }
    
    next();
});

// Make user available to all templates
app.use((req, res, next) => {
    res.locals.currUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    
    next();
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    const { statusCode = 500, message = 'Something went wrong!' } = err;
    if (process.env.NODE_ENV === 'development') {
        console.error(err);
    }
    res.status(statusCode).render('listings/error', { message });
});

// Routes
app.use("/user", userRouter);
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/payment", paymentRouter);
app.use("/bookings", bookingRouter);
app.use('/chatbot', chatbotRoutes);
app.use('/pages', pagesRoutes);

// Add redirect from /login to /user/login
app.get("/login", (req, res) => {
    res.redirect("/user/login");
});

// Add static route for receipts
app.use("/receipts", express.static(path.join(__dirname, "receipts")));

// 404 handler with better error message
app.all("*", (req, res) => {
    console.log("404 - Route not found:", req.originalUrl);
    res.status(404).render("listings/error", { 
        message: "Page Not Found!",
        statusCode: 404,
        suggestion: "The page you're looking for doesn't exist. Please check the URL or go back to the homepage."
    });
});

// Force using port 5000
const PORT = 5000;

// Improved server error handling
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please stop the process using this port and try again.`);
        process.exit(1);
    } else {
        console.error('Server error:', err);
        process.exit(1);
    }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    server.close(() => {
        process.exit(1);
    });
});
