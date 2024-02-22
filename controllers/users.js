const User = require("../models/user");

module.exports.renderRegister = (req, res) => {
  res.render("users/register");
};

module.exports.register = async (req, res, next) => {
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
};

module.exports.renderLogin = (req, res) => {
  res.render("users/login");
};

module.exports.login = (req, res) => {
  req.flash("success", "Welcome back!");
  const redirectURL = res.locals.returnTo || "/campgrounds";
  delete req.session.returnTo;
  res.redirect(redirectURL);
};

module.exports.logout = (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash("success", "Goodbye!");
    res.redirect("/campgrounds");
  });
};
