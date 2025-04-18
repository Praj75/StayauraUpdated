const User = require("../models/users");
const Booking = require("../models/booking");
const Listing = require("../models/listing");

module.exports.renderSignupForm = (req, res) => {
  res.render("users/signup.ejs");
};

module.exports.signup = async (req, res, next) => {
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
    res.redirect("/user/signup");
  }
};

module.exports.renderLoginForm = (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/dashboard');
  }
  res.render("users/login", {
    title: "Login",
    error: req.flash("error"),
    success: req.flash("success"),
    info: req.flash("info")
  });
};

module.exports.login = async (req, res) => {
  req.flash("success", "Welcome back!");
  const redirectUrl = req.session.returnTo || "/dashboard";
  delete req.session.returnTo;
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "Logged out!");
    res.redirect("/listings");
  });
};

module.exports.renderDashboard = async (req, res) => {
  const today = new Date();
  const [upcomingBookings, pastBookings] = await Promise.all([
    Booking.find({ user: req.user._id, checkIn: { $gte: today } }).populate('listing'),
    Booking.find({ user: req.user._id, checkOut: { $lt: today } }).populate('listing')
  ]);

  res.render('users/dashboard', {
    layout: 'layouts/boilerplate',
    upcomingBookings,
    pastBookings
  });
};

module.exports.renderProfile = async (req, res) => {
  try {
    const [bookings, listings] = await Promise.all([
      Booking.find({ user: req.user._id }).populate('listing').sort({ checkIn: -1 }).limit(5),
      Listing.find({ owner: req.user._id }).sort({ _id: -1 }).limit(5)
    ]);

    res.render('users/profile', {
      user: req.user,
      bookings,
      listings,
      title: 'My Profile'
    });
  } catch (error) {
    console.error('Error fetching profile data:', error);
    req.flash('error', 'Failed to load profile data');
    res.redirect('/');
  }
};

module.exports.updateSettings = async (req, res) => {
  try {
    const { username, email, currentPassword, newPassword, confirmPassword, notifications } = req.body;
    const user = await User.findById(req.user._id);
    let changes = [];
    
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        req.flash("error", "Username already exists");
        return res.redirect("/user/settings");
      }
      user.username = username;
      changes.push("username");
    }
    
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        req.flash("error", "Email already exists");
        return res.redirect("/user/settings");
      }
      user.email = email;
      changes.push("email");
    }
    
    if (currentPassword || newPassword || confirmPassword) {
      if (!currentPassword || !newPassword || !confirmPassword) {
        req.flash("error", "All password fields are required to change password");
        return res.redirect("/user/settings");
      }
      if (newPassword !== confirmPassword) {
        req.flash("error", "New passwords do not match");
        return res.redirect("/user/settings");
      }
      
      const isPasswordValid = await user.comparePassword(currentPassword);
      if (!isPasswordValid) {
        req.flash("error", "Current password is incorrect");
        return res.redirect("/user/settings");
      }
      
      user.password = newPassword;
      changes.push("password");
    }
    
    if (notifications) {
      user.notifications = {
        email: notifications.email === 'on',
        marketing: notifications.marketing === 'on'
      };
      changes.push("notification preferences");
    }
    
    if (changes.length > 0) {
      await user.save();
      req.flash("success", `Successfully updated: ${changes.join(", ")}`);
    } else {
      req.flash("info", "No changes were made");
    }
    
    res.redirect("/user/settings");
  } catch (err) {
    console.error("Error updating settings:", err);
    req.flash("error", "Failed to update settings. Please try again.");
    res.redirect("/user/settings");
  }
};

module.exports.deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    await Promise.all([
      Listing.deleteMany({ owner: user._id }),
      Booking.deleteMany({ user: user._id }),
      User.findByIdAndDelete(user._id)
    ]);
    
    req.logout((err) => {
      if (err) console.error('Error logging out after account deletion:', err);
      req.flash('success', 'Your account has been deleted');
      res.redirect('/');
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    req.flash('error', 'Failed to delete account');
    res.redirect('/user/settings');
  }
};

module.exports.renderWishlist = async (req, res) => {
    try {
        if (!req.user) {
            req.flash('error', 'Please login to view your wishlist');
            return res.redirect('/user/login');
        }

        // Find the user and populate their wishlist with listing details
        const user = await User.findById(req.user._id).populate({
            path: 'wishlist',
            populate: [
                { path: 'owner' },
                { path: 'images' }
            ]
        });

        if (!user) {
            req.flash('error', 'User not found.');
            return res.redirect('/');
        }

        // Process listings for image fallback
        const processedListings = (user.wishlist || []).map(listing => {
            if (!listing) return null;
            const listingObj = listing.toObject();
            
            // Ensure images array exists
            if (!listingObj.images) {
                listingObj.images = [];
            }
            
            // If no valid images, add default
            if (listingObj.images.length === 0) {
                listingObj.images.push({
                    url: '/images/default-property.jpg'
                });
            }
            
            return listingObj;
        }).filter(item => item !== null);

        res.render("users/wishlist", { 
            title: "My Wishlist", 
            listings: processedListings,
            currUser: req.user,
            csrfToken: req.csrfToken()
        });

    } catch (error) {
        console.error("Error rendering wishlist:", error);
        req.flash("error", "Could not load your wishlist.");
        res.redirect("/");
    }
};
