var mongoose = require('mongoose');
var uuid = require('uuid/v4');

var Schema = mongoose.Schema;

var flagSchema = require('./flagSchema');

module.exports.requirementSchema = new Schema({
    classFrom: String,
    classTo: String,
    flags: [flagSchema]
})