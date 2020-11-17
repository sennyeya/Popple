var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * Flag for whether a requirement's pre requisites need specific things. Think, 'need a C or better in 120 to take 245'
 * Currently, not flushed out.
 */
module.exports.flagSchema = new Schema({
    value: String
})