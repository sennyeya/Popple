
module.exports = {
    isCompleted : function(node, student){
        if(!student.completedClasses){
            return false;
        }
        return student.completedClasses.includes(node.class.id);
    }

    
}