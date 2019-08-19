
module.exports = {
    isCompleted : function(node, student){
        return student.completedClasses.includes(node.class.name);
    }

    
}