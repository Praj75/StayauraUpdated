const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middleware");
const Booking = require("../models/booking");
const Listing = require("../models/listing");
const User = require("../models/users");
const passport = require("passport");

// Debug middleware
router.use((req, res, next) => {
    console.log("User Routes:", req.method, req.originalUrl);
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
        // Always redirect to /listings after login
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
        csrfToken: req.csrfToken(),
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
            const redirectUrl = req.session.redirectUrl || "/listings";
            delete req.session.redirectUrl;
            res.redirect(redirectUrl);
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
});

// Profile Routes - handle both /profile and /user/profile
const handleProfile = async (req, res) => {
    try {
        if (!req.user) {
            req.flash("error", "User not found");
            return res.redirect("/login");
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

module.exports = router; 