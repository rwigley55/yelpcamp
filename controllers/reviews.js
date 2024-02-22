const Campground = require("../models/campground");
const Review = require("../models/review");

module.exports.createReview = async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  const review = new Review(req.body.review);
  // take the userid from request and save it as the review author:
  review.author = req.user._id;
  // We set the reviews key as an array in the campgroundSchema
  campground.reviews.push(review);
  await review.save();
  await campground.save();
  req.flash("success", "Created new review!");
  res.redirect(`/campgrounds/${campground._id}`);
};

// Take campground id and take review id and find the 2 things we want to update
module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;
  // Taking reviewID and pulling anything with that ID out of reviews array
  await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete();
  req.flash("success", "Successfully deleted review!");
  res.redirect(`/campgrounds/${id}`);
};
