var mongoose = require('mongoose');
const Schema = mongoose.Schema;
var {String, ObjectId} = mongoose.Schema.Types;

/**
 * Flag for whether a requirement's pre requisites need specific things. Think, 'need a C or better in 120 to take 245'
 * Currently, not flushed out.
 * */
let flagSchema = new Schema({
    type: String,
    requirement: {type:ObjectId, ref:"classes"}
})

module.exports.flagSchema = flagSchema;

module.exports.Flag = mongoose.model('flags', flagSchema)

module.exports.flags = {
    TIER_1_ARTS:"TIER 1 ARTS",
    TIER_1_SCIENCE:"TIER 1 SCIENCE",
    TIER_2_ARTS:"TIER 2 ARTS",
    TIER_2_SCIENCE:"TIER 2 SCIENCE",
    C_OR_BETTER:"C OR BETTER",
    MUTUALLY_EXCLUSIVE:"MUTUALLY_EXCLUSIVE" // Will only count classes that do not apply to other groups.
}