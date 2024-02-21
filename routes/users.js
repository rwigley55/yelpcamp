const express = require("express");
const router = express.Router();
const passport = require("passport");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/user");
const { storeReturnTo } = require("../middleware");

router.get("/register", (req, res) => {
  res.render("users/register");
});

router.post(
  "/register",
  catchAsync(async (req, res, next) => {
    try {
      // destructure and save the email, username, and pw from the req.body
      const { email, username, password } = req.body;
      // create a new variable. the variable creates a new User model that has the email and username
      const user = new User({ email, username });
      // .register is a method on User model, pass in the user object and the password, which will get auto hashed and salted
      const registeredUser = await User.register(user, password);
      // Signs the user in after they login:
      req.login(registeredUser, (err) => {
        if (err) return next(err);
        req.flash("success", "Welcome to Yelp Camp!");
        res.redirect("/campgrounds");
      });
    } catch (e) {
      req.flash("error", e.message);
      res.redirect("register");
    }
  })
);

router.get("/login", (req, res) => {
  res.render("users/login");
});

router.post(
  "/login",
  // use the storeReturnTo middleware to save the returnTo value from session to res.locals
  // import to use this middleware before passport.authenticate
  storeReturnTo,
  // passport.authenticate logs the user in and clears req.session
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  (req, res) => {
    req.flash("success", "Welcome back!");
    const redirectURL = res.locals.returnTo || "/campgrounds";
    delete req.session.returnTo;
    res.redirect(redirectURL);
  }
);

// Passport adds .logout() method to our req object
router.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash("success", "Goodbye!");
    res.redirect("/campgrounds");
  });
});

module.exports = router;
