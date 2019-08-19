var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var studentSchema = new Schema({
    name: String,
    plans:[{type:Schema.Types.ObjectId, ref:'plans'}],
    completedClasses:[{type:Schema.Types.ObjectId, ref:'classes'}],
    options:[{type:Schema.Types.ObjectId, ref:"plannodes"}],
    semesterPlan:[{type:Schema.Types.ObjectId, ref:'classes'}]
})

module.exports.Student = mongoose.model('student',studentSchema)