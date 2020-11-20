var mongoose = require("mongoose");
const Schema = mongoose.Schema;
var {Number, Date, String} = mongoose.Schema.Types;

/**
 * Store a logical semester
 */
const semesterSchema = new Schema({
  startDate: Date,
  endDate: Date,
  name: String,
  maximumCredits: Number
});

const Bucket = mongoose.model("semesters", semesterSchema);

module.exports.Bucket = Bucket;