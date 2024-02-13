const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");

const campgrounds = require("./routes/campgrounds");
const reviews = require("./routes/reviews");

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

// Configs
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// Session
const sessionConfig = {
  secret: "thisshouldbeabettersecret",
  resave: false,
  saveUninitialized: true,
  // Some general session configs:
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
app.use(flash());

// Middleware, locals.success is now available on every request
// no need to pass anything to templates
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// ********************************************* //
// Route Handlers
// If we need access to the :id parameter, set mergeParams to true when you import
app.use("/campgrounds", campgrounds);
app.use("/campgrounds/:id/reviews", reviews);
// ********************************************* //

app.get("/", (req, res) => {
  res.render("home");
});

// ********************************************* //
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
