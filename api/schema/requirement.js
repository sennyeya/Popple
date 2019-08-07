var mongoose = require('mongoose');

var Schema = mongoose.Schema;

requirementSchema = new Schema({
    classFrom: {type:Schema.Types.ObjectId, ref:'classes'},
    classTo: {type:Schema.Types.ObjectId, ref:"classes"},
    flags: [{type:Schema.Types.ObjectId, ref:'flags'}]
})

module.exports.Requirement = mongoose.model('requirements', requirementSchema);