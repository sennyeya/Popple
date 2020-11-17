var mongoose = require('mongoose');

var Schema = mongoose.Schema;

/**
 * Class as in the physical class, will be mapped to a requirement for each plan. The same class can have different pre-requisites based on which major you are in, think DATA363 and MATH323.
 * TODO: Implement the requirement -> class relationship. Plans have requirements which each have a class that has pre-requisites based on the plan.
 */
classSchema =  new Schema({
    name: String,
    requirements: [{type:Schema.Types.ObjectId, ref:"requirements"}],
    relevantAlternatives: [{type:Schema.Types.ObjectId, ref:"classes"}],
    credit: {type:Number, default: 3}
})

module.exports.classSchema = classSchema;

module.exports.Class = mongoose.model('classes', classSchema)