
module.exports = {
    /*
    This method returns a bool whether the student has completed the class from the current ndoe.
    */
    isCompleted : function(node, student){
        if(!student.completedClasses){
            return false;
        }
        return student.completedClasses.includes(node.class.id);
    }    
}