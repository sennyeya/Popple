const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const calendarScheme = new Schema({
  googleId: String,
  sId: Number,
  iFrame: String
});

const Calendar = mongoose.model("calendar", calendarScheme);

module.exports = Calendar;