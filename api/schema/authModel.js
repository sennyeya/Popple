var mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  googleId: String,
  displayName: String,
  image: String,
  username: String,
  password: String,
  isAdmin: Boolean
});

const User = mongoose.model("authUser", userSchema);

module.exports = {User};