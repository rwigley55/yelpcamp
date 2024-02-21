module.exports.isLoggedIn = (req, res, next) => {
  // isAuthenticated is coming from passport, auto added to req object
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash("error", "You must be signed in");
    return res.redirect("/login");
  }
  next();
};

// Saves returnTo value from the session to the Express.js app res.locals object
// Use middleware before passport.authenticate() is executed
// In Express.js, res.locals is an object that provides a way to pass data through the application during the request-response cycle.
// It allows you to store variables that can be accessed by your templates and other middleware functions.
module.exports.storeReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo;
  }
  next();
};
