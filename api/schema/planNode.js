var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var planNodeSchema = new Schema({
    class:{type:Schema.Types.ObjectId, ref:'classes'},
    children:[{type:Schema.Types.ObjectId, ref:'plannodes'}]
})

var autoPopulateChildren = function(next) {
    this.populate('children');
    this.populate('class');
    next();
};

planNodeSchema
.pre('findOne', autoPopulateChildren)
.pre('find', autoPopulateChildren)

module.exports.PlanNode = mongoose.model('plannodes',planNodeSchema)