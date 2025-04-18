// Add reply to review
router.post('/:id/reviews/:reviewId/reply', isLoggedIn, async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) {
            req.flash('error', 'Listing not found');
            return res.redirect('/listings');
        }

        // Check if user is the listing owner
        if (!listing.author.equals(req.user._id)) {
            req.flash('error', 'You are not authorized to reply to this review');
            return res.redirect(`/listings/${listing._id}`);
        }

        const review = listing.reviews.id(req.params.reviewId);
        if (!review) {
            req.flash('error', 'Review not found');
            return res.redirect(`/listings/${listing._id}`);
        }

        // Add reply
        review.reply = req.body.reply;
        review.replyDate = new Date();
        await listing.save();

        req.flash('success', 'Reply added successfully');
        res.redirect(`/listings/${listing._id}`);
    } catch (err) {
        console.error(err);
        req.flash('error', 'Something went wrong');
        res.redirect(`/listings/${req.params.id}`);
    }
}); 