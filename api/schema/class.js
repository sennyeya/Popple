var mongoose = require('mongoose');

var Schema = mongoose.Schema;

classSchema =  new Schema({
    name: String,
    requirements: [{type:Schema.Types.ObjectId, ref:"requirements"}],
    relevantAlternatives: [{type:Schema.Types.ObjectId, ref:"classes"}],
    credit: {type:Number, default: 3}
})

module.exports.classSchema = classSchema;

module.exports.Class = mongoose.model('classes', classSchema)