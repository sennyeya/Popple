var mongoose = require('mongoose');
const Schema = mongoose.Schema;
var {ObjectId, Number, String} = mongoose.Schema.Types;

/**
 * Plan node. 
 */
var planNodeSchema = new Schema({
    name:String,
    classes:[{type:ObjectId, ref:'classes'}],
    flags:[{type:ObjectId, ref:'flags'}]
})

module.exports.PlanNode = mongoose.model('plannodes',planNodeSchema)