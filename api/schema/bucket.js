/**
 * This model stores the logical representation of the students plan buckets.
 */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

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