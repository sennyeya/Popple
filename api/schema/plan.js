var mongoose = require('mongoose');
const Schema = mongoose.Schema;
var {ObjectId, Number, String} = mongoose.Schema.Types;

/**
 * Plan. Think BA in CS or BS in CS, each plan is a set Major or Minor with specific requirements to complete it.
 * TODO: Create requirement layer.
 */
var planSchema = new Schema({
    name: String,
    minCredits: {type:Number, default:120},
    nodes:[{type:ObjectId, ref:'plannodes'}],
    requirements:[{type:ObjectId, ref:'requirements'}],
    //grouping:[{type:ObjectId, ref:'flags'}]
})

module.exports.Plan = mongoose.model('plans', planSchema)