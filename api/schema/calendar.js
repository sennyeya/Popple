var mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Types = mongoose.Types

const calendarScheme = new Schema({
  studentId: {type:Schema.Types.ObjectId, ref:"student"},
  // Id corresponding to google id.
  googleId: String,
  // Where this calendar comes from? Expectation to allow for outlook as well.
  type: String,
  // Name of the calendar. 
  name: String
});

const Calendar = mongoose.model("calendar", calendarScheme);

module.exports = Calendar;