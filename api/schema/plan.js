var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var planSchema = new Schema({
    name: String,
    nodes:[{type:Schema.Types.ObjectId, ref:'plannodes'}],
    grouping:[{type:Schema.Types.ObjectId, ref:'flags'}]
})

module.exports.Plan = mongoose.model('plans', planSchema)