var mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Types = mongoose.Types

const calendarScheme = new Schema({
  studentId: {type:Schema.Types.ObjectId, ref:"student"},
  calendarId: {type:Schema.Types.ObjectId, ref:"calendar"},
});

const calendarStudentJoin = mongoose.model("calendarStudentJoin", calendarScheme);

module.exports = calendarStudentJoin;