const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
  url: String,
  filename: String,
});

// Virtual Property
ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});

// Set virtuals to be true, pass it into the Schema
const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema(
  {
    title: String,
    images: [ImageSchema],
    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    price: Number,
    description: String,
    location: String,
    author: {
      type: Schema.Types.ObjectId,
      // reference to a User instance
      ref: "User",
    },
    reviews: [
      {
        // ObjectId from the Review Model
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  opts
);

// Virtual Property on CampgroundSchema
CampgroundSchema.virtual("properties.popUpMarkup").get(function () {
  return `
  <strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
  <p>${this.description.substring(0, 30)}...</p>`;
});

// query middleware
// doc passed in has reviews
// delete all reviews where their ID field is in our deleted doc's reviews array
CampgroundSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Review.deleteMany({
      _id: {
        $in: doc.reviews,
      },
    });
  }
});
module.exports = mongoose.model("Campground", CampgroundSchema);
