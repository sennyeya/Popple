var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var studentSchema = new Schema({
    name: String,
    plans:[{type:Schema.Types.ObjectId, ref:'plans'}],
    completedClasses:[{type:Schema.Types.ObjectId, ref:'classes'}],
    options:[{type:Schema.Types.ObjectId, ref:"plannodes"}],
    semesterPlan:[{type:Schema.Types.ObjectId, ref:'classes'}],
    desiredCredits:Number
})

var autoPopulatePlan = function(next) {
    this.populate('plans');
    next();
};

studentSchema
.pre('findOne', autoPopulatePlan)
.pre('find', autoPopulatePlan)
.pre('findById', autoPopulatePlan)

module.exports.Student = mongoose.model('student',studentSchema)