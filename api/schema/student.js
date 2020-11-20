var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const {ObjectId, Date, Number, String} = mongoose.Schema.Types

var studentSchema = new Schema({
    name: String,
    plans:[{type:ObjectId, ref:'plans'}],
    buckets:[{type:ObjectId, ref:'buckets'}],
    desiredCredits:{type:Number, default:15},
    user: {type:ObjectId, ref:"authusers"},
    lastAnsweredPlanSurvey:Date,
    lastAnsweredClassSurvey:Date
})

module.exports.Student = mongoose.model('students',studentSchema)