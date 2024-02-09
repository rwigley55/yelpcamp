const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const { campgroundSchema } = require("./schemas.js");
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");
const Campground = require("./models/campground");

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

// schema Validation
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
    const campground = await Campground.findById(req.params.id);
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
