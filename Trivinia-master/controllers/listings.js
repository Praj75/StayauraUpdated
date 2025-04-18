const Listing = require("../models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });
const User = require("../models/users");
const Review = require('../models/review');

module.exports.getAllListings = async (req, res) => {
    try {
        const allListings = await Listing.find({});
        res.render("listings/index", { 
            allListings,
            currUser: req.user
        });
    } catch (err) {
        console.error("Error fetching listings:", err);
        req.flash('error', 'Failed to fetch listings');
        res.redirect('/');
    }
};

module.exports.getUserListings = async (req, res) => {
    try {
        console.log("Fetching listings for user:", req.user._id);
        const userListings = await Listing.find({ owner: req.user._id })
            .populate('owner')
            .sort({ createdAt: -1 });
        console.log("Found listings:", userListings);
        
        // Process listings to ensure image URLs are properly formatted
        const processedListings = userListings.map(listing => {
            const listingObj = listing.toObject();
            // Ensure image URL exists and is properly formatted, provide default if not
            if (!listingObj.image || !listingObj.image.url) {
                listingObj.image = {
                    url: '/logo3.png', // Use logo3.png as default
                    filename: 'logo3.png'
                };
            }
            return listingObj;
        });

        res.render("listings/my-listings.ejs", { 
            listings: processedListings,
            title: 'My Listings',
            currUser: req.user // Pass currUser for the navbar
        });
    } catch (error) {
        console.error("Error in getUserListings:", error);
        req.flash("error", "Unable to fetch your listings");
        res.redirect("/"); // Redirect to home on error
    }
};

module.exports.renderNewForm = async(req, res) => {
    res.render("listings/new.ejs");
};

module.exports.getListingById = async (req, res) => {
    try {
        const { id } = req.params;
        const listing = await Listing.findById(id)
            .populate({
                path: 'reviews',
                populate: {
                    path: 'author'
                }
            })
            .populate('owner');

        if (!listing) {
            req.flash("error", "Listing does not exist!");
            return res.redirect("/listings");
        }

        // Ensure currUser is properly passed to the view
        const currUser = req.user || null;

        res.render("listings/show.ejs", { 
            listing,
            currUser,
            mapToken: process.env.MAP_TOKEN
        });

    } catch (error) {
        console.error("Error fetching listing details:", error);
        req.flash("error", "Could not load listing details.");
        res.redirect("/listings");
    }
};

module.exports.createListing = async (req, res) => {
    try {
        if (!req.body.listing.location) {
            req.flash("error", "Location is required!");
            return res.redirect("/listings/new");
        }

        let response = await geocodingClient.forwardGeocode({
            query: req.body.listing.location,
            limit: 1
        }).send();

        if (!response.body.features.length) {
            req.flash("error", "Location not found. Please try again.");
            return res.redirect("/listings/new");
        }

        const geometry = {
            type: "Point",
            coordinates: response.body.features[0].geometry.coordinates
        };

        console.log("Geometry Data:", geometry);
       
        let images = [];
        if (req.file) {
            images.push({
                url: req.file.path,
                filename: req.file.filename
            });
        }

        const newListing = new Listing({
            ...req.body.listing,
            geometry: geometry,
            owner: req.user._id,
            images: images
        });

        let savedListing = await newListing.save();
        console.log("Saved Listing:", savedListing);

        // Update user's listings array
        const user = await User.findById(req.user._id);
        user.listings = user.listings || [];
        user.listings.push(savedListing._id);
        await user.save();

        req.flash("success", "Successfully created new listing!");
        res.redirect("/listings/my-listings");
    } catch (error) {
        console.error("Error creating listing:", error);
        req.flash("error", "Failed to create listing.");
        res.redirect("/listings/new");
    }
};

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing does not exist!");
        return res.redirect("/listings");
    }

    if (!listing.owner.equals(req.user._id)) {
        req.flash("error", "You don't have permission to edit this listing!");
        return res.redirect(`/listings/${id}`);
    }

    let originalImageUrl = '/logo3.png'; // Default image
    if (listing.images && listing.images.length > 0) {
        originalImageUrl = listing.images[0].url;
    }
    
    // If the image is from Cloudinary, resize it
    if (originalImageUrl.includes('cloudinary.com')) {
        originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    }

    res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
    const { id } = req.params;
    try {
        const listing = await Listing.findById(id);
        
        if (!listing) {
            req.flash("error", "Listing not found!");
            return res.redirect("/listings");
        }

        if (!listing.owner.equals(req.user._id)) {
            req.flash("error", "You don't have permission to update this listing!");
            return res.redirect(`/listings/${id}`);
        }

        const updateData = { ...req.body.listing };
        
        // Handle image updates
        if (req.file) {
            // If there's a new image, add it to the images array
            updateData.images = listing.images || [];
            updateData.images.push({
                url: req.file.path,
                filename: req.file.filename
            });
        }

        // Handle image deletion if specified
        if (req.body.deleteImages) {
            const deleteIndices = JSON.parse(req.body.deleteImages);
            updateData.images = listing.images.filter((_, index) => !deleteIndices.includes(index));
        }

        await Listing.findByIdAndUpdate(id, updateData);
        req.flash("success", "Successfully updated listing!");
        res.redirect(`/listings/${id}`);
    } catch (error) {
        console.error("Error updating listing:", error);
        req.flash("error", "Failed to update listing.");
        res.redirect(`/listings/${id}/edit`);
    }
};

module.exports.deleteListing = async (req, res) => {
    const { id } = req.params;
    try {
        const listing = await Listing.findById(id);
        
        if (!listing) {
            req.flash("error", "Listing not found!");
            return res.redirect("/listings");
        }

        if (!listing.owner.equals(req.user._id)) {
            req.flash("error", "You don't have permission to delete this listing!");
            return res.redirect(`/listings/${id}`);
        }

        await Listing.findByIdAndDelete(id);
        req.flash("success", "Successfully deleted listing!");

        // Check if the request expects JSON response
        if (req.headers['content-type'] === 'application/json') {
            return res.json({ success: true });
        }
        
        res.redirect("/listings");
    } catch (error) {
        console.error("Error deleting listing:", error);
        req.flash("error", "Failed to delete listing.");
        
        // Check if the request expects JSON response
        if (req.headers['content-type'] === 'application/json') {
            return res.status(500).json({ 
                success: false, 
                error: "Failed to delete listing" 
            });
        }
        
        res.redirect(`/listings/${id}`);
    }
};

module.exports.searchListings = async (req, res) => {
    try {
        const { location, checkIn, checkOut, search } = req.query;
        
        let query = {};
        
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$or = [
                { title: searchRegex },
                { description: searchRegex },
                { location: searchRegex },
                { country: searchRegex }
            ];
        }
        else if (location) {
            const locationRegex = new RegExp(location, 'i');
            query.$or = [
                { location: locationRegex },
                { country: locationRegex }
            ];
        }
        
        if (checkIn && checkOut) {
            query.availability = {
                $not: {
                    $elemMatch: {
                        $or: [
                            {
                                startDate: { $lte: new Date(checkIn) },
                                endDate: { $gte: new Date(checkIn) }
                            },
                            {
                                startDate: { $lte: new Date(checkOut) },
                                endDate: { $gte: new Date(checkOut) }
                            }
                        ]
                    }
                }
            };
        }
        
        console.log("Search query:", JSON.stringify(query));
        
        const listings = await Listing.find(query);
        console.log(`Found ${listings.length} listings matching the search criteria`);
        
        res.json({ listings });
    } catch (error) {
        console.error("Search error:", error);
        res.status(500).json({ error: "An error occurred while searching" });
    }
};

// Controller function to toggle like status
module.exports.toggleLike = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({ 
                success: false, 
                message: 'Please login to like this listing',
                redirect: '/login'
            });
        }

        const user = await User.findById(userId);
        const listing = await Listing.findById(id);

        if (!listing) {
            return res.status(404).json({ 
                success: false, 
                message: 'Listing not found' 
            });
        }

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        // Initialize wishlist if it doesn't exist
        if (!user.wishlist) {
            user.wishlist = [];
        }

        // Check if listing is already liked
        const likedIndex = user.wishlist.findIndex(likedId => likedId.equals(listing._id));

        let liked = false;
        if (likedIndex > -1) {
            // Already liked, so unlike (remove from wishlist)
            user.wishlist.splice(likedIndex, 1);
            liked = false;
        } else {
            // Not liked, so like (add to wishlist)
            user.wishlist.push(listing._id);
            liked = true;
        }

        await user.save();
        res.status(200).json({ 
            success: true, 
            liked: liked,
            message: liked ? 'Listing added to wishlist' : 'Listing removed from wishlist'
        });

    } catch (error) {
        console.error("Error toggling like:", error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error',
            error: error.message 
        });
    }
};