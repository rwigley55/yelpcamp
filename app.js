const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const { campgroundSchema, reviewSchema } = require("./schemas.js");
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");
const Campground = require("./models/campground");
const Review = require("./models/review");

mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const app = express();

//EJS
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// campgroundschema validation middleware
const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    // details is an array of objects
    // map over the error.details to make a single string message, take it and pass into ExpressError
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

const validateReview = (req, res, next) => {
  // Pass the entire body, hopefully it includes the review info, we want rating and body
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};
// ********************************************* //

app.get("/", (req, res) => {
  res.render("home");
});

// Index
app.get(
  "/campgrounds",
  catchAsync(async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
  })
);

// Order matters here
app.get("/campgrounds/new", (req, res) => {
  res.render("campgrounds/new");
});

// Create
app.post(
  "/campgrounds",
  // Middleware schema validation:
  validateCampground,
  catchAsync(async (req, res, next) => {
    // throw express error because we are inside of the catchAsync function, it will catch it and hand it off to next()
    // ExpressError allows us to customize the message and statusCode
    // if (!req.body.campground)
    //   throw new ExpressError("Invalid Campground Data", 400);

    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

// Show
app.get(
  "/campgrounds/:id",
  catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id).populate(
      "reviews"
    );
    res.render("campgrounds/show", { campground });
  })
);

// Update
app.get(
  "/campgrounds/:id/edit",
  catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    res.render("campgrounds/edit", { campground });
  })
);

// Update PUT request
app.put(
  "/campgrounds/:id",
  // Middleware schema validation:
  validateCampground,
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    // Spread operator, spread the req.body.campground object into this new object
    const campground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

// Delete
// Form button sends a delete request
// Form sends a POST request to the URL below
// Fake out express to think it's a DELETE request because M.O.
app.delete(
  "/campgrounds/:id",
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
  })
);

// Adding review to campgrounds
app.post(
  "/campgrounds/:id/reviews",
  validateReview,
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    // We set the reviews key as an array in the campgroundSchema
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

// Delete reviews from page
// Take campground id and take review id and find the 2 things we want to update
app.delete(
  "/campgrounds/:id/reviews/:reviewId",
  catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    // Taking reviewID and pulling anything with that ID out of reviews array
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete();
    res.redirect(`/campgrounds/${id}`);
  })
);

// Express Errors

//For every single request, every path
app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

// Error handler
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;

  if (!err.message) err.message = "SOMETHING WENT WRONG";
  // err will be the app.all error that gets caught and passed here
  res.status(statusCode).render("error", { err });
  res.send("SOMETHING WENT WRONG");
});

// ********************************************* //
app.listen(3000, () => {
  console.log("Serving on Port 3000");
});
