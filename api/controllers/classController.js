const {Class} = require("../schema/class");

module.exports = {
    isCompleted : function(node, student){
        if(!student.completedClasses){
            return false;
        }
        return student.completedClasses.includes(node.class.id);
    },

    addClass: async function(className, classRequirements, credits, equalClasses){
        await Class.create({name:className, credit:credits, requirements:classRequirements, relevantAlternatives:equalClasses});
    }
}