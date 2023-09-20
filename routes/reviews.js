import {createRequire} from "module";

import catchAsync from "../utilities/catchAsync.js";
import {doesCampgroundExist, doesReviewExist, validateReview, isLoggedIn, isReviewAuthor} from "../middleware.js";
import {addReview, deleteReview} from "../controllers/reviews.js";

const require = createRequire(import.meta.url);
const express = require('express');

const router = express.Router({mergeParams : true});

router.post('/', doesCampgroundExist, isLoggedIn, validateReview, catchAsync(addReview))

router.delete('/:reviewId', doesCampgroundExist, doesReviewExist, isReviewAuthor, catchAsync(deleteReview))

export {router as reviewRouter};