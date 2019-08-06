var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var planNodeSchema = new Schema({
    class:{type:Schema.Types.ObjectId, ref:'classes'},
    parents:[{type:Schema.Types.ObjectId, ref:'plannodes'}]
})

var autoPopulateParents = function(next) {
    this.populate('parents');
    this.populate('class');
    next();
};

planNodeSchema
.pre('findOne', autoPopulateParents)
.pre('find', autoPopulateParents)

module.exports.PlanNode = mongoose.model('plannodes',planNodeSchema)