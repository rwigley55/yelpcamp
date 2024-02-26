// To seed my DB
// Call this index.js file in node
// Deletes everything in the DB
// Replaces/fills DB with new made-up campgrounds

const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Campground = require("../models/campground");

mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

// Pass in an array, return random element from the array
const sample = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 300; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      // reed2 userID
      author: "65d524289eb02d67fe905e82",
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Praesentium consequatur laboriosam dolor distinctio soluta nisi, perferendis, maxime temporibus voluptatem adipisci aperiam numquam repudiandae. Labore et expedita, tenetur assumenda iusto rerum?",
      price,
      geometry: {
        type: "Point",
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude,
        ],
      },
      images: [
        {
          url: "https://res.cloudinary.com/dvge5rzac/image/upload/v1708633927/YelpCamp/zgssjjp5o3vsow6ycmyn.jpg",
          filename: "YelpCamp/zgssjjp5o3vsow6ycmyn",
        },
        {
          url: "https://res.cloudinary.com/dvge5rzac/image/upload/v1708633927/YelpCamp/dkejwrthhqn7ehz1gaub.jpg",
          filename: "YelpCamp/dkejwrthhqn7ehz1gaub",
        },
        {
          url: "https://res.cloudinary.com/dvge5rzac/image/upload/v1708633928/YelpCamp/xftakdnmuwatp76lmpiz.jpg",
          filename: "YelpCamp/xftakdnmuwatp76lmpiz",
        },
      ],
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
