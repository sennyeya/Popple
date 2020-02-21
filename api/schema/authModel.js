const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  googleId: String,
  displayName: String,
  image: String
});

const User = mongoose.model("authUser", userSchema);

module.exports = User;