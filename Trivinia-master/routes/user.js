const express = require("express");
const router = express.Router();
const passport = require("passport");
const wrapAsync = require("../utils/wrapAsync");
const { saveRedirectUrl, isLoggedIn } = require("../middleware");
const userController = require("../controllers/users");
const Listing = require("../models/listing");
const User = require("../models/users");

// Signup routes
router.route("/signup")
  .get((req, res) => {
    console.log("GET /signup route hit");
    console.log("Is authenticated:", req.isAuthenticated());
    if (req.isAuthenticated()) {
      req.flash('info', 'You are already logged in.');
      return res.redirect('/listings');
    }
    console.log("Rendering signup page");
    res.render("users/signup", { 
      title: "Sign Up",
      csrfToken: req.csrfToken(),
      messages: {
        error: req.flash('error'),
        success: req.flash('success'),
        info: req.flash('info')
      }
    });
  })
  .post(wrapAsync(userController.signup));

// Login routes
router.route("/login")
  .get((req, res) => {
    console.log("GET /login route hit");
    console.log("Is authenticated:", req.isAuthenticated());
    console.log("Session:", req.session);
    if (req.isAuthenticated()) {
      req.flash('info', 'You are already logged in.');
      return res.redirect('/listings');
    }
    console.log("Rendering login page");
    res.render("users/login", {
        title: "Login",
        error: req.flash("error"),
        success: req.flash("success"),
        info: req.flash("info")
    });
  })
  .post(
    (req, res, next) => {
      console.log("POST /login route hit");
      console.log("Request body:", req.body);
      console.log("Session before auth:", req.session);
      next();
    },
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: "Invalid email or password. Please try again."
    }),
    (req, res) => {
      console.log("Login successful");
      console.log("User:", req.user);
      console.log("Session after auth:", req.session);
      req.flash('success', `Welcome back, ${req.user.username}!`);
      const redirectUrl = req.session.returnTo || '/listings';
      delete req.session.returnTo;
      res.redirect(redirectUrl);
    }
  );

// Logout route
router.get("/logout", (req, res) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be logged in to log out.');
        return res.redirect('/login');
    }
    
    const username = req.user.username;
    req.flash('success', `Goodbye, ${username}! You have been successfully logged out.`);
    
    req.logout((err) => {
        if (err) {
            console.error('Error during logout:', err);
            req.flash('error', 'An error occurred during logout. Please try again.');
            return res.redirect('/listings');
        }
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
            }
            res.clearCookie('connect.sid');
            res.redirect('/listings');
        });
    });
});

// Dashboard route - requires authentication
router.get("/dashboard", isLoggedIn, wrapAsync(userController.renderDashboard));

// Profile route - requires authentication
router.get("/profile", isLoggedIn, wrapAsync(userController.renderProfile));

// Settings route
router.get("/settings", isLoggedIn, wrapAsync(async (req, res) => {
    res.render("users/settings", { 
        title: "Account Settings",
        user: req.user,
        messages: {
            error: req.flash('error')[0],
            success: req.flash('success')[0]
        }
    });
}));

router.post("/settings", isLoggedIn, wrapAsync(userController.updateSettings));

// Delete account
router.post("/delete", isLoggedIn, wrapAsync(userController.deleteAccount));

// My Listings route
router.get("/my-listings", isLoggedIn, wrapAsync(async (req, res) => {
    const listings = await Listing.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.render("users/my-listings", {
        title: "My Listings",
        listings
    });
}));

// Wishlist route
router.get("/wishlist", isLoggedIn, wrapAsync(userController.renderWishlist));

module.exports = router;
