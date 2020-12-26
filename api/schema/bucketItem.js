/**
 * This model stores the logical representation of the students plan buckets.
 */

var mongoose = require("mongoose");
const Schema = mongoose.Schema;
var {ObjectId, Date, String} = mongoose.Schema.Types;

/**
 * Each item in the semester plan bucket display.
 */
const bucketItemSchema = new Schema({
    currentBucket:{type:ObjectId, ref:"buckets"},
    children: [{type:ObjectId, ref:"classes"}],
    originalBucket: {type:ObjectId, ref:"buckets"},
    classItem:{type:ObjectId, ref:"classes"}
});

const BucketItem = mongoose.model("bucketitems", bucketItemSchema);

module.exports.BucketItem = BucketItem;