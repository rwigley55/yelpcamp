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

// Index
router.get("/", catchAsync(campgrounds.index));

// Order matters here
router.get("/new", isLoggedIn, campgrounds.renderNewForm);

// Create
router.post(
  "/",
  isLoggedIn,
  // Middleware schema validation:
  validateCampground,
  catchAsync(campgrounds.createCampground)
);

// Show
router.get("/:id", catchAsync(campgrounds.showCampground));

// Update
router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(campgrounds.renderEditForm)
);

// Update PUT request
router.put(
  "/:id",
  isLoggedIn,
  isAuthor,
  // Middleware schema validation:
  validateCampground,
  catchAsync(campgrounds.updateCampground)
);

// Delete
router.delete(
  "/:id",
  isLoggedIn,
  isAuthor,
  catchAsync(campgrounds.deleteCampground)
);

module.exports = router;
