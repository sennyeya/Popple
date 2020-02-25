const {Class} = require("../schema/class");
const {Requirement} = require("../schema/requirement")

module.exports = {
    isCompleted : function(node, student){
        if(!student.completedClasses){
            return false;
        }
        return student.completedClasses.includes(node.class.id);
    },

    addClass: async function(className, classRequirements, credits, equalClasses){
        await Class.create({name:className, credit:credits, requirements:classRequirements, relevantAlternatives:equalClasses});
    },

    getClasses: async function(){
        return await Class.find({}).exec()
    },

    getItem: async function(id){
        return await Class.findById(id).exec()
    },

    getRequirements: async function(id){
        return await Requirement.find({'classTo': id}).exec();
    }
}
