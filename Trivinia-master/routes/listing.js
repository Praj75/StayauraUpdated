const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn,isOwner,validateListing} = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer  = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });

// Static routes first (before any :id routes)
router.get("/my-listings", isLoggedIn, wrapAsync(listingController.getUserListings));
router.get("/new", isLoggedIn, listingController.renderNewForm);
router.get("/api/search", wrapAsync(listingController.searchListings));

// Root route
router.get("/", wrapAsync(listingController.getAllListings));
router.post("/", isLoggedIn, upload.single("listing[image]"), validateListing, wrapAsync(listingController.createListing));

// Dynamic routes with :id
router.get("/:id", wrapAsync(listingController.getListingById));
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));
router.put("/:id", isLoggedIn, isOwner, upload.single("listing[image]"), validateListing, wrapAsync(listingController.updateListing));
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));

// Like/Unlike route (needs to be after /:id/edit to avoid conflict)
router.post("/:id/like", isLoggedIn, wrapAsync(listingController.toggleLike));

module.exports = router;
