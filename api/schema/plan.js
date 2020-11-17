var mongoose = require('mongoose');

var Schema = mongoose.Schema;

/**
 * Plan. Think BA in CS or BS in CS, each plan is a set Major or Minor with specific requirements to complete it.
 * TODO: Create requirement layer.
 */
var planSchema = new Schema({
    name: String,
    nodes:[{type:Schema.Types.ObjectId, ref:'plannodes'}],
    grouping:[{type:Schema.Types.ObjectId, ref:'flags'}]
})

module.exports.Plan = mongoose.model('plans', planSchema)