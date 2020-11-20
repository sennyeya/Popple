var mongoose = require('mongoose');
const Schema = mongoose.Schema;
var {String} = mongoose.Schema.Types;

/**
 * Flag for whether a requirement's pre requisites need specific things. Think, 'need a C or better in 120 to take 245'
 * Currently, not flushed out.
 * */
let flagSchema = new Schema({
    type: String
})

module.exports.flagSchema = flagSchema;

module.exports.Flag = mongoose.model('flags', flagSchema)