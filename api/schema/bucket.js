/**
 * This model stores the logical representation of the students plan buckets.
 */

var mongoose = require("mongoose");
const Schema = mongoose.Schema;
var {ObjectId, Date, String} = mongoose.Schema.Types;

/**
 * Stores a user's semester plan. Each bucket should have a list of sub-buckets for each requirement on a plan. Think the collapseable panes on the UAccess advisement report.
 * TODO: Implement the requirement layer.
 */
const bucketSchema = new Schema({
  name: String,
  // List of classes in the bucket.
  nodes: [{type:ObjectId, ref:"classes"}],
  // Corresponding semester, probably index.
  semester: {type:ObjectId, ref:"semesters"},

  planNode: {type:ObjectId, ref:'plannodes'}
});

const Bucket = mongoose.model("buckets", bucketSchema);

module.exports.Bucket = Bucket;