const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    // Not a validation. Sets up an index:
    unique: true,
  },
});

// Pass in the result of requiring the package to UserSchema.plugin
// This will add on to our schema: a unique username, a password field, additional methods
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
