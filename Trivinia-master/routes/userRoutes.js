const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middleware");
const Booking = require("../models/booking");
const Listing = require("../models/listing");
const User = require("../models/users");
const passport = require("passport");
const wrapAsync = require('../utils/wrapAsync');

// Debug middleware
router.use((req, res, next) => {
    console.log("User Routes:", req.method, req.originalUrl);
    next();
});

// Debug middleware for all routes
router.use((req, res, next) => {
    console.log(`User Route Hit: ${req.method} ${req.originalUrl}`);
    next();
});

// Login routes
router.get("/login", (req, res) => {
    if (req.isAuthenticated()) {
        req.flash('info', 'You are already logged in.');
        return res.redirect('/listings');
    }
    res.render("users/login", {
        title: "Login",
        error: req.flash("error"),
        success: req.flash("success"),
        info: req.flash("info")
    });
});

// Add a route for /login that redirects to /user/login
router.get("/", (req, res) => {
    res.render("users/login", {
        title: "Login",
        error: req.flash("error"),
        success: req.flash("success"),
        info: req.flash("info")
    });
});

router.post("/login", 
    passport.authenticate("local", {
        failureRedirect: "/user/login",
        failureFlash: "Invalid email or password. Please try again."
    }),
    (req, res) => {
        req.flash('success', `Welcome back, ${req.user.username}!`);
        res.redirect('/listings');
    }
);

// Signup routes
router.get("/signup", (req, res) => {
    if (req.isAuthenticated()) {
        req.flash('info', 'You are already logged in.');
        return res.redirect('/listings');
    }
    res.render("users/signup", { 
        title: "Sign Up",
        messages: {
            error: req.flash('error'),
            success: req.flash('success'),
            info: req.flash('info')
        }
    });
});

router.post("/signup", async (req, res) => {
    try {
        const { email, password, username } = req.body;
        const registeredUser = await User.create({
            email,
            password,
            username
        });

        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash("success", "Welcome!");
            res.redirect("/listings");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/user/signup");
    }
});

// Profile Routes - handle both /profile and /user/profile
const handleProfile = async (req, res) => {
    try {
        if (!req.user) {
            req.flash("error", "User not found");
            return res.redirect("/user/login");
        }

        // Get user's bookings and listings
        const [bookings, listings] = await Promise.all([
            Booking.find({ author: req.user._id })
                .populate({
                    path: 'listing',
                    select: 'title images price location'
                })
                .sort({ createdAt: -1 }),
            Listing.find({ owner: req.user._id })
                .select('title images price location')
                .sort({ createdAt: -1 })
        ]);

        res.render("users/profile", { 
            user: req.user, 
            bookings, 
            listings,
            title: 'My Profile',
            layout: 'layouts/boilerplate'
        });
    } catch (error) {
        console.error("Error loading profile:", error);
        req.flash("error", "Error loading profile");
        res.redirect("/");
    }
};

router.get("/profile", isLoggedIn, handleProfile);
router.get("/user/profile", isLoggedIn, handleProfile);

// Settings Route
router.get("/settings", isLoggedIn, (req, res) => {
    res.render("users/settings", { 
        user: req.user,
        messages: {
            error: req.flash('error'),
            success: req.flash('success')
        }
    });
});

// Update Settings Route
router.post("/settings", isLoggedIn, async (req, res) => {
    try {
        const { username, email, phone, currentPassword, newPassword, confirmPassword } = req.body;
        const user = req.user;

        if (!username || !email) {
            req.flash("error", "Username and email are required");
            return res.redirect("/user/settings");
        }

        const existingUser = await User.findOne({ email, _id: { $ne: user._id } });
        if (existingUser) {
            req.flash("error", "Email is already in use");
            return res.redirect("/user/settings");
        }

        user.username = username;
        user.email = email;
        if (phone) user.phone = phone;

        if (currentPassword || newPassword || confirmPassword) {
            if (!currentPassword || !newPassword || !confirmPassword) {
                req.flash("error", "All password fields are required to change password");
                return res.redirect("/user/settings");
            }

            if (newPassword !== confirmPassword) {
                req.flash("error", "New passwords do not match");
                return res.redirect("/user/settings");
            }

            const isMatch = await user.comparePassword(currentPassword);
            if (!isMatch) {
                req.flash("error", "Current password is incorrect");
                return res.redirect("/user/settings");
            }

            user.password = newPassword;
        }

        await user.save();
        req.flash("success", "Settings updated successfully");
        res.redirect("/user/settings");
    } catch (error) {
        console.error("Error updating settings:", error);
        req.flash("error", "Failed to update settings. Please try again.");
        res.redirect("/user/settings");
    }
});

// Delete Account Route
router.post("/delete-account", isLoggedIn, async (req, res) => {
    try {
        const user = req.user;
        await Promise.all([
            Booking.deleteMany({ user: user._id }),
            Listing.deleteMany({ owner: user._id }),
            user.remove()
        ]);

        req.logout((err) => {
            if (err) {
                console.error("Error during logout:", err);
                return res.status(500).json({ error: "Error during logout" });
            }
            req.flash("success", "Your account has been deleted");
            res.redirect("/");
        });
    } catch (error) {
        console.error("Error deleting account:", error);
        req.flash("error", "Failed to delete account");
        res.redirect("/user/settings");
    }
});

// Logout routes - handle both GET and POST
router.get("/logout", handleLogout);
router.post("/logout", handleLogout);

// Logout handler function
function handleLogout(req, res, next) {
    console.log("Logout route hit - Method:", req.method);
    console.log("Is authenticated:", req.isAuthenticated());
    console.log("User:", req.user);
    
    if (!req.isAuthenticated()) {
        console.log("User not authenticated");
        req.flash('error', 'You must be logged in to log out.');
        return res.redirect('/user/login');
    }
    
    const username = req.user.username;
    console.log(`Logging out user: ${username}`);
    
    // Set flash message before destroying session
    req.flash('success', `Goodbye, ${username}! You have been successfully logged out.`);
    
    req.logout((err) => {
        if (err) {
            console.error('Error during logout:', err);
            return next(err);
        }
        
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
                return next(err);
            }
            
            res.clearCookie('connect.sid');
            res.redirect('/user/login');
        });
    });
}

// Wishlist Routes
router.get('/wishlist', isLoggedIn, wrapAsync(async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate({
                path: 'wishlist',
                populate: {
                    path: 'owner',
                    select: 'username email'
                }
            });

        if (!user) {
            req.flash('error', 'User not found');
            return res.redirect('/');
        }

        res.render('users/wishlist', { 
            wishlist: user.wishlist || [],
            title: 'My Wishlist'
        });
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        req.flash('error', 'Failed to load wishlist');
        res.redirect('/');
    }
}));

// Add to wishlist
router.post('/wishlist/:listingId', isLoggedIn, wrapAsync(async (req, res) => {
    try {
        const { listingId } = req.params;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if listing is already in wishlist
        if (user.wishlist && user.wishlist.includes(listingId)) {
            return res.status(400).json({ error: 'Listing already in wishlist' });
        }

        // Add to wishlist
        if (!user.wishlist) {
            user.wishlist = [];
        }
        user.wishlist.push(listingId);
        await user.save();

        res.json({ success: true, message: 'Added to wishlist' });
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        res.status(500).json({ error: 'Failed to add to wishlist' });
    }
}));

// Remove from wishlist
router.delete('/wishlist/:listingId', isLoggedIn, wrapAsync(async (req, res) => {
    try {
        const { listingId } = req.params;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Remove from wishlist
        if (user.wishlist) {
            user.wishlist = user.wishlist.filter(id => id.toString() !== listingId);
            await user.save();
        }

        res.json({ success: true, message: 'Removed from wishlist' });
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        res.status(500).json({ error: 'Failed to remove from wishlist' });
    }
}));

module.exports = router; 