var mongoose = require('mongoose');
var uuid = require('uuid/v4');
var requirementSchema = require('./requirementSchema');

var Schema = mongoose.Schema;

classSchema =  new Schema({
    name: String,
    id: String,
    requirements: [requirementSchema],
    relevantAlternatives: [String]
})

module.exports.classSchema = classSchema;

module.exports.Class = mongoose.model('Classes', classSchema)