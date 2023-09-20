import Campground from "../models/campgrounds.js";
import Review from "../models/reviews.js";

const addReview = async (req, res) => {
    const {id} = req.params;
    const campground = req.session.foundCampground;
    const {review} = req.body;
    const newReview = new Review(review);
    newReview.author = req.user;
    await newReview.save();
    campground.reviews.push(newReview);
    await campground.save();
    req.flash('success', 'Review added successfully');
    res.redirect(`/campgrounds/${id}`);
}

const deleteReview = async (req, res) => {
    const {id, reviewId} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {$pull : {reviews : reviewId}});
    const review = await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Review deleted successfully');
    res.redirect(`/campgrounds/${id}`);
}

export {addReview, deleteReview};