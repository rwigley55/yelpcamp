const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Specify my credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// Setting up an instance of CloudinaryStorage
const storage = new CloudinaryStorage({
  cloudinary,
  params: { folder: "YelpCamp", allowedFormats: ["jpeg", "png", "jpg"] },
});

module.exports = {
  cloudinary,
  storage,
};
