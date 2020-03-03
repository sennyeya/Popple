const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Types = mongoose.Types

const calendarScheme = new Schema({
  sid: {type:Schema.Types.ObjectId, ref:"student"},
  id: String,
  name: String
});

const Calendar = mongoose.model("calendar", calendarScheme);

module.exports = Calendar;