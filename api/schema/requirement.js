var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var {ObjectId, Number} = mongoose.Schema.Types;

/**
 * TODO: Rename this to requisite. This should be defined at the plan level, plans may have different requirements for each class.
 */
requirementSchema = new Schema({
    from: {type:ObjectId, ref:'classes'},
    to: {type:ObjectId, ref:"classes"},
    flags: [{type:ObjectId, ref:'flags'}]
})

module.exports.Requirement = mongoose.model('requirements', requirementSchema);