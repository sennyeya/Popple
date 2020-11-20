var mongoose = require('mongoose');
const Schema = mongoose.Schema;
var {ObjectId, Number, String} = mongoose.Schema.Types;

/**
 * Class as in the physical class, will be mapped to a requirement for each plan. The same class can have different pre-requisites based on which major you are in, think DATA363 and MATH323.
 * TODO: Implement the requirement -> class relationship. Plans have requirements which each have a class that has pre-requisites based on the plan.
 */
classSchema =  new Schema({
    name: String,
    relevantAlternatives: [{type:ObjectId, ref:"classes"}],
    credit: {type:Number, default: 3},
    flags:[{type:ObjectId, ref:'flags'}]
})

module.exports.classSchema = classSchema;

module.exports.Class = mongoose.model('classes', classSchema)