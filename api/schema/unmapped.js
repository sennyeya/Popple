var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var unmappedSchema = new Schema({
    classFrom:String,
    classTo:String
})

module.exports.UnmappedReq = mongoose.model('unmapped', unmappedSchema, 'unmapped');