const express = require("express");
// All params from app.js are merged into this file now
const router = express.Router({ mergeParams: true });

const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");
const Campground = require("../models/campground");
const Review = require("../models/review");
const reviews = require("../controllers/reviews");
const catchAsync = require("../utils/catchAsync");

// *****************Routes*********************** //

// Adding review to campgrounds
router.post("/", isLoggedIn, validateReview, catchAsync(reviews.createReview));

// Delete reviews from page

router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  catchAsync(reviews.deleteReview)
);

module.exports = router;
