const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const {
  isLoggedIn,
  isAuthor,
  validateCampground,
} = require("../middleware.js");

const Campground = require("../models/campground");

// Index
router.get(
  "/",
  catchAsync(async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
  })
);

// Order matters here
router.get("/new", isLoggedIn, (req, res) => {
  res.render("campgrounds/new");
});

// Create
router.post(
  "/",
  isLoggedIn,
  // Middleware schema validation:
  validateCampground,
  catchAsync(async (req, res, next) => {
    // throw express error because we are inside of the catchAsync function, it will catch it and hand it off to next()
    // ExpressError allows us to customize the message and statusCode
    // if (!req.body.campground)
    //   throw new ExpressError("Invalid Campground Data", 400);

    const campground = new Campground(req.body.campground);
    // take the userid and save it as the campground author:
    campground.author = req.user._id;
    await campground.save();
    // Create a new flash:
    req.flash("success", "Successfully made a new campground!");
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

// Show
router.get(
  "/:id",
  catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id)
      // populate all the reviews from the reviews array, on the 1 campground we're finding
      // then populate on each one their author
      .populate({ path: "reviews", populate: { path: "author" } })
      // populate the one author on this campground
      .populate("author");
    if (!campground) {
      req.flash("error", "Cannot find that campground!");
      return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show", { campground });
  })
);

// Update
router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
      req.flash("error", "Cannot find that campground!");
      return res.redirect("/campgrounds");
    }
    res.render("campgrounds/edit", { campground });
  })
);

// Update PUT request
router.put(
  "/:id",
  isLoggedIn,
  isAuthor,
  // Middleware schema validation:
  validateCampground,
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    // Spread operator, spread the req.body.campground object into this new object
    const campground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    req.flash("success", "Successfully updated campground!");
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

// Delete
// Form button sends a delete request
// Form sends a POST request to the URL below
// Fake out express to think it's a DELETE request because M.O.
router.delete(
  "/:id",
  isLoggedIn,
  isAuthor,
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted campground!");
    res.redirect("/campgrounds");
  })
);

module.exports = router;
