/**
 * This model stores the logical representation of the students plan buckets.
 */

var mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * Stores a user's semester plan. Each bucket should have a list of sub-buckets for each requirement on a plan. Think the collapseable panes on the UAccess advisement report.
 * TODO: Implement the requirement layer.
 */
const bucketSchema = new Schema({
  name: String,
  // List of classes in the bucket.
  nodes: [{type:Schema.Types.ObjectId, ref:"plannodes"}],
  // Corresponding semester, probably index.
  semesterStart: Date,
  semesterEnd: Date,
  studentId: {type:Schema.Types.ObjectId, ref:"students"}
});

var autoPopulate = function(next) {
    this.populate('nodes');
    next();
};

bucketSchema
.pre('findOne', autoPopulate)
.pre('find', autoPopulate)

const Bucket = mongoose.model("buckets", bucketSchema);

module.exports.Bucket = Bucket;