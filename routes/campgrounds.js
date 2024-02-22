const express = require("express");
const router = express.Router();
const campgrounds = require("../controllers/campgrounds");
const catchAsync = require("../utils/catchAsync");
const {
  isLoggedIn,
  isAuthor,
  validateCampground,
} = require("../middleware.js");

const Campground = require("../models/campground");

router
  .route("/")
  // Index
  .get(catchAsync(campgrounds.index))
  // Create
  .post(
    isLoggedIn,
    // Middleware schema validation:
    validateCampground,
    catchAsync(campgrounds.createCampground)
  );

// Order matters here - needs to go before :id, otherwise thinks "new" is an ID
router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router
  .route("/:id")
  // Show
  .get(catchAsync(campgrounds.showCampground))
  // Update PUT request
  .put(
    isLoggedIn,
    isAuthor,
    // Middleware schema validation:
    validateCampground,
    catchAsync(campgrounds.updateCampground)
  )
  // Delete
  .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

// Update
router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(campgrounds.renderEditForm)
);

module.exports = router;
