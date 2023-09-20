import {createRequire} from "module";

import ExpressError from "./ExpressError.js";
import {campgroundSchema, reviewSchema} from "./joiSchema.js";
import Campground from "./models/campgrounds.js";
import Review from "./models/reviews.js";

const require = createRequire(import.meta.url);
const {isValid} = require('mongoose').Types.ObjectId;

const doesCampgroundExist = async (req, res, next) => {
    const {id} = req.params;
    if(!isValid(id)) {
        req.flash('error', 'Cannot find that campground');
        return res.redirect('/campgrounds');
    }
    const campground = await Campground.findById(id).populate({path : 'reviews', populate : {path : 'author'}}).populate('author');
    if(!campground) {
        req.flash('error', 'Cannot find that campground');
        return res.redirect('/campgrounds');
    }
    
    req.session.foundCampground = campground;
    next();
}

const doesReviewExist = async (req, res, next) => {
    const {id, reviewId} = req.params;
    if(!isValid(reviewId)) {
        req.flash('error', 'Cannot find that review');
        return res.redirect(`/campgrounds/${id}`);
    }
    const review = await Review.findById(reviewId);
    if(!review) {
        req.flash('error', 'Cannot find that review');
        return res.redirect(`/campgrounds/${id}`);
    }
    req.session.foundReview = review;
    next();
}

const validateCampground = (req, res, next) => {
    const campground = req.body;
    const {error} = campgroundSchema.validate(campground);
    if(error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }
    else {
        next();
    }
}

const validateReview = (req, res, next) => {
    const review = req.body;
    const {error} = reviewSchema.validate(review);
    if(error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }
    else {
        next();
    }
}

const storeReturnTo = (req, res, next) => {
    if(req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

const isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must login first!');
        return res.redirect('/login');
    }
    next();
}

const storeCamp = (req, res, next) => {
    // if(req.session.foundCampground) {
    //     res.locals.foundCampground = req.session.foundCampground;
    // }
    next();
}

const isCampgroundAuthor = async (req, res, next) => {
    const {id} = req.params;
    // console.log(req.session.foundCampground.author);
    if(!req.session.foundCampground.author.equals(req.user._id)) {
        req.flash('error', 'You are not authorized to do that');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

const isReviewAuthor = async (req, res, next) => {
    const {id, reviewId} = req.params;
    if(!req.session.foundReview.author.equals(req.user._id)) {
        req.flash('error', 'You are not authorized to do that');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

export {doesCampgroundExist, doesReviewExist, validateCampground, validateReview, storeReturnTo, isLoggedIn, storeCamp, isCampgroundAuthor, isReviewAuthor};