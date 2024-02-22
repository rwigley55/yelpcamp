const Campground = require("../models/campground");
const { cloudinary } = require("../cloudinary");

module.exports.index = async (req, res, next) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/new");
};

module.exports.createCampground = async (req, res, next) => {
  const campground = new Campground(req.body.campground);
  // map over the array that's been added to req.files
  // take the path and filename, make a new object for each one
  // put that in an array, array length is however many images were uploaded
  // add that to campground
  campground.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  // take the userid and save it as the campground author:
  campground.author = req.user._id;
  await campground.save();
  console.log(campground);
  // Create a new flash:
  req.flash("success", "Successfully made a new campground!");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampground = async (req, res, next) => {
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
};

module.exports.renderEditForm = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground) {
    req.flash("error", "Cannot find that campground!");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/edit", { campground });
};

module.exports.updateCampground = async (req, res, next) => {
  const { id } = req.params;
  console.log(req.body);
  // Spread operator, spread the req.body.campground object into this new object
  const campground = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground,
  });
  // map over the array that's been added to req.files
  // take the path and filename, make a new object for each one
  // put that in an array, array length is however many images were uploaded
  // push that to campground
  const imgs = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  // Spread the array: don't pass in an array, but take the data from the array and pass that into push
  campground.images.push(...imgs);
  await campground.save();
  // If there are images to delete
  // Update the campground (that we've already found)
  // Pull from the images array, all images where the filename of that image is in the req.body.deleteImages array
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await campground.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
    console.log(campground);
  }
  req.flash("success", "Successfully updated campground!");
  res.redirect(`/campgrounds/${campground._id}`);
};

// Form button sends a delete request
// Form sends a POST request to the URL below
// Fake out express to think it's a DELETE request because M.O.
module.exports.deleteCampground = async (req, res, next) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted campground!");
  res.redirect("/campgrounds");
};
