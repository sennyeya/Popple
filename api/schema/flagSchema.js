var mongoose = require('mongoose');
var uuid = require('uuid/v4')
var Schema = mongoose.Schema;

module.exports.flagSchema = new Schema({
    id: String,
    value: String
})