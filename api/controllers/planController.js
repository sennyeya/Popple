var mongoose = require('mongoose');
var {Class} = require('../schema/class');
var {Requirement} = require('../schema/requirement');
var {UnmappedReq} = require('../schema/unmapped');
var {Plan} = require('../schema/plan');
var {PlanNode} = require('../schema/planNode');
var {Student} = require('../schema/student');
var ClassService = require('../services/classService');

mongoose.Promise = global.Promise;

/*
Adds the passed in excel spreadsheet to the tree.
Params: value, the value of a parsed spreadsheet.
*/
module.exports.loadClassesAndReqs = async function(value){
    var classObj = new Class({
        name:value.name,
        credit:value.credit
    });
    Class.find({name:value.name},async function(err, res){
        if(res&&res.length){
            classObj = res[0]
        }

        if(value.requirements){
            await Promise.all(value.requirements.split(",").map(o=>{
                o=o.trim();
                return new Promise(function(resolve, reject){
                    // Check if the map object contains the value we're looking for. In other words, has this class been referenced by a class already added?

                    // Check if the class we're trying to create the prerequisite from, exists.
                    Class.find({name:o}, function(err, res){
                        if(res && res.length){
                            Class.findOne({name:o}, function(err, reqClass){
                                if(err){
                                    throw new Error(err);
                                }
                                Requirement.find({classTo:classObj._id, classFrom:reqClass._id}, (err, res)=>{
                                    var req;
                                    if(!res || !res.length){
                                        req = new Requirement({classTo:classObj._id, classFrom:reqClass._id});
                                        req.save(function(err){
                                            if(err){
                                                throw new Error(err);
                                            }
                                        });
                                    }else{
                                        req = res[0]
                                    }
                                    resolve(req._id);
                                })
                            })
                        }else{
                            var map = new UnmappedReq({
                                classFrom:value.name,
                                classTo: o
                            })
                            map.save(function(err){
                                if(err){
                                    reject(err);
                                }else{
                                    resolve();
                                }
                            })
                        }
                    })
                })
                
            })).then(value=>{
                classObj.requirements=value;
            });
        }else{
            classObj.requirements = []
        }

        var plan = new Plan({
            name:"CSC"
        })
        
        Class.find({name:classObj.name}, function(err,res){
            if(!res || !res.length){
                classObj.save(function(err){
                    if(err){
                        throw new Error(err);
                    }
                })
            }else{
                Class.findOneAndUpdate({name:classObj.name}, {requirements:classObj.requirements}, function(err){
                    if(err){
                        throw new Error(err);
                    }
                })
            }
        });
        
        Requirement.find({}).exec(async function(err, reqs){
            var childrenNodes = [];
            for(var elem in reqs){
                loop:{
                    for(var otherElems in reqs){
                        if(reqs[elem].classTo._id.equals(reqs[otherElems].classFrom._id)){
                            break loop;
                        }
                    }
                    childrenNodes.push(reqs[elem].classTo._id)
                }
            }
            var topNodes = childrenNodes.map(e=>e._id);

            var pastVals = []
            while(childrenNodes.length>0){
                childrenNodes = childrenNodes.filter(e=>{
                    if(!pastVals.includes(e)){
                        pastVals.push(e);
                        return true;
                    }
                    return false;
                })
                pastVals = pastVals.concat(childrenNodes);
                var set = [...new Set(childrenNodes)];
                childrenNodes = await getChildNodes(set);
                await tryMerge([...new Set(childrenNodes)]);
            }

            var topPlanNodes = await PlanNode.find({'class':{$in:topNodes}}).exec();
            console.log(topPlanNodes);
            topPlanNodes = topPlanNodes.map(e=>e._id);

            Plan.find({name:"CSC"}, function(err, result){
                if(result&&result.length){
                    Plan.findOneAndUpdate({name:"CSC"},{nodes:topPlanNodes},function(err, res){
                        if(err){
                            throw new Error(err)
                        }
                    })
                }
                else{
                    plan.save(function(err){
                        if(err){
                            throw new Error(err)
                        }
                    })
                }
            })
            })
            
        })
    var student = await Student.find({name:"Aramis"}).exec();

    student = student[0]

    student.plans = [(await Plan.find({name:"CSC"}).exec())[0]];
    student.completedClasses = [
        (await Class.find({name:"CSC110"}).exec())[0],
        (await Class.find({name:"CSC120"}).exec())[0],
        (await Class.find({name:"CSC210"}).exec())[0]
    ];
    student.options = [];
    student.semesterPlan = [];
    student.desiredCredits = 15;

    await student.save();
};

/*
This method attempts to merge the dataset after a single insert operation that may have inserted two or more
class nodes that have the same data.
Params: set, the set of classes.
*/
tryMerge = async function(set){
    for(let parentClass of set){
        const nodes = await PlanNode.find({'class':parentClass}).exec();
        if(nodes&&nodes.length>1){ // If there are 2...
            var arr = [];
            for(let node of nodes){
                for(let child of node.children){ // Get children from both.
                    if(!arr.includes(child._id)){
                        arr.push(child._id)
                    }
                }
            }

            var firstNode = nodes[0];
            await PlanNode.findOneAndUpdate({'_id':firstNode._id}, {children:arr}).exec();
            nodes.shift();                                  // Move past the one we just made the first node.
            for(let node of nodes){
                let refs = await PlanNode.find({'children':node.id}).exec();
                for(let ref of refs){
                    let arr = ref.children.map(e=>{
                        return e.id==node.id?firstNode:e;
                    })
                    await PlanNode.findByIdAndUpdate(ref.id, {children:arr}).exec();
                }
            }
            /*
            WE WILL NEED TO ENSURE THAT ALL REFERENCES TO NODES THAT ARE BEING DELETED ARE SENT TO THE FIRST NODE.
            */
            await PlanNode.deleteMany({'_id':{$in:nodes}})  // Delete extra merges.
        }
    }

    return new Promise((resolve)=>{
        resolve();
    })
}

/*
This method returns the child node ids of the passed in set of classes.
Params: set, a set of classes to return the child nodes from.
*/
getChildNodes = async function(set){
    const classSet = await Class.find({'_id':{$in:set}}).populate('requirements').exec();

    var arr = [];
    for(let elem of classSet){
        const reqs = await Requirement.find({classTo:elem}).exec();
        for(let req of reqs){
            if(!arr.includes(req)){
                arr.push(req);
            }
        }
    }

    var mappedVals = [];
    for(let req of arr){
        const classTo = await Class.findById(req.classTo._id).exec(); // Get the current node

        if(classTo){
            var nodes = await PlanNode.find({'class':classTo.id}).exec(); // Get the current node.
            var childClass = await PlanNode.find({'class':req.classFrom.id}).exec(); // Get child node.

            if(!nodes||!nodes.length){
                await addChildNode(classTo);
                nodes = await PlanNode.find({'class':classTo.id}).exec();
            }

            var id;
            if(!childClass||!childClass.length){
                id = await addChildNode(req.classFrom); // Add child node if it doesnt exist
                childClass = await PlanNode.find({'class':nodes[0].class.id}).exec();
            }else{
                id = childClass[0]._id;
            }

            await updatePlanNode(nodes[0], id); // Update the parent with the child id.
            mappedVals.push(req.classFrom.id);
        }
    }
    return new Promise(async (resolve, reject)=>{
        resolve(mappedVals)
    })
}

/*
This class updates the children of the passed in node with the passed in id.
Params: node, the node to get the children from.
        id, the id of the node to append.
*/
updatePlanNode = async function(node, id){
    const newId = await PlanNode.findById(id).exec();
    console.log("updating node "+node.class.name+" with class "+newId.class.name)

    var discovered = [];
    var children = []

    if(node.children){
        children = node.children.filter(e=>{
            if(!discovered.includes(e._id)){
                discovered.push(e._id);
                return true;
            }
            return false;
        });
    }

    children = children.map(e=>e._id);

    if(children.includes(id)){
        console.log("already added")
        return new Promise((resolve, reject)=>resolve(id));
    }
    children.push(id);

    await PlanNode.findByIdAndUpdate(node.id, {children:children}).exec();

    const res = await PlanNode.findById(node.id).exec();

    return new Promise((resolve, reject)=>{
        resolve(res.class.id)
    });
}

/*
This method adds a child node with the value of the passed in obj.
Params: classObj, a class item.
*/
addChildNode = async function(classObj){
    console.log("adding node for "+classObj.name)

    var planNode = await PlanNode.findOne({'class':classObj._id}).exec();
    if(planNode){
        return new Promise((resolve, reject)=>{
            resolve(planNode._id)
        });
    }

    planNode = new PlanNode({
        class:classObj._id,
        children:[]
    })
    await planNode.save();

    const newNode = await PlanNode.find({'class':classObj._id}).exec();

    return new Promise((resolve, reject)=>{
        resolve(newNode[0]._id)
    });
}

/*
This method generates the next semester plan for the student by recursively exploring the tree,
generating the set of options the student can take and then recursively exploring those options
to select the best possible fit for the student's desired credit count.
Params: id, the id of the student.
*/
module.exports.generateSemester = async function(id){
    // Load student. TODO
    const student = await Student.findById(id).exec();

    if(!student){
        throw new Error("No student found with that ID.");
    }

    for(let plan of student.plans){
        var tree = {name:"root", children:[]};
        for(let topNode of plan.nodes){
            tree.children.push(await PlanNode.findById(topNode).exec());
        }
    }

    const options = await returnOptions(student, tree);

    student.options = options;

    plan = await generatePlan(options, student.desiredCredits);

    student.semesterPlan = plan;

    await student.save();

    return new Promise((resolve, reject)=>{
        resolve(plan);
    })
}

/*
This method returns the options that the student can take in the next semester.
Params: student, the student data object.
        tree, the tree/graph of classes that the student has to complete to graduate.
*/
returnOptions = async function(student, tree){
    var options = [];
    var invalidChildren = [];
    var queue = [tree];
    var discovered = {};
    await recurHelperOptions(student, tree, queue, discovered, options, invalidChildren);
    return new Promise((resolve, reject)=>resolve(options));
}

/*
This method generates the possible options by doing a breadthfirst recursive search.
Params: student, the student data object, holds previous class records.
        tree, the current tree we are operating on.
        queue, the queue of nodes that we are exploring.
        discovered, the list of nodes that have been explored.
        options, the list of results that the student can take.
*/
recurHelperOptions = async function(student, tree, queue, discovered, options){
    if(!queue.length){
        return new Promise((resolve, reject)=>resolve());
    }
    tree = queue.shift();
    if(await isValidClass(student, tree)){
        if(!options.some(e=>e.id == tree.id)){
            const planNode = await PlanNode.findById(tree.id).exec();
            options.push(planNode); // TODO: Get the actual credit value.
        }
    }else{
        for(let child of tree.children){
            if(!discovered[child.id]){
                discovered[child.id]= true;
                queue.push(child);
            }
        }
    }
    await recurHelperOptions(student, tree, queue, discovered, options);
}

/*
This method checks if the student has completed the class contained in the param, tree. 
This method is not recursive, it merely checks to see if the student already has a record of the class we are looking at.
Param: student, the student object holding all records of classes taken.
        tree, the current node that we are trying to decide if the student has taken yet.
*/
isValidClass = async function(student, tree){
    if(tree.name == "root"){
        return new Promise((resolve, reject)=>resolve(false));
    }

    // Ensure that the class we are looking at wasnt added from another branch.
    if(student.completedClasses.includes(tree.class.id)){
        return new Promise((resolve, reject)=>resolve(false));
    }

    for(let child of tree.children){
        let req = await Requirement.find({'classFrom':child.id, 'classTo':tree.id});
        if(!student.completedClasses.includes(child.class.id)){
            return new Promise((resolve, reject)=>resolve(false));
        }

        if(!req.flags||!req.flags.length){
            continue;
        }
        for(let flag of req.flags){
            if(!isCompletedFlag(student, flag)){
                return new Promise((resolve, reject)=>resolve(false));
            }
        }
    }
    return new Promise((resolve, reject)=>resolve(true));
}

/*
This method generates the plan for the desired number of credits from the passed in options. Will return the closest possible
answer based on credit count.
Params: options, the set of all class options this student can take.
        credits, the desired number of credits.
*/
generatePlan = async function(options, credits){
    var plan = [];
    var i =0;

    while(true){
        if(await recurHelperPlan(options, plan, Number(credits), i)){
            break;
        }
        i=i+1;
    }
    return new Promise((resolve, reject)=>resolve(plan));
}

/*
This method returns the first plan that matches the desired number of credits.
Params: options, a list of all possible classes this person can take.
        plan, the array that represents the classes that the student should take in the next semester.
        credits, the desired number of credits for this semester.
        cushion, a number that holds the credit cusion that the plan can hold. Will increment on every call,
                to allow the closest plan to be created.
*/
recurHelperPlan = async function(options, plan, credits, cushion){
    if(Math.abs(getCreditSum(plan)-credits)==cushion){
        return true;
    }
    for(let option of options){
        if((getCreditSum(plan)+option.class.credit)<=credits){
            plan.push(option)
            if(await recurHelperPlan(options.filter(e=>e!=option), plan, credits, cushion)){
                return true;
            }
            plan.pop(option);
        }
    }
    return false;
}

/*
This method returns the credit sum for all values currently in the plan.
Parameters: plan, an array of plannodes.
Returns: an integer sum of all credits from those plannodes.
*/
getCreditSum = function(plan){
    if(!plan||!plan.length){
        return 0;
    }

    var total = 0;
    for(let val of plan){
        total+=val.class.credit;
    }
    return total;
}

/*
This method ties to an api hook, meant to retrieve the graphic version of the plan for the student.
*/
module.exports.retrievePlanGraph = async function(name, studentId){
    var student = await Student.findById(studentId).exec();

    var plan = await Plan.find({'name':name}).exec();

    const tree = await returnVisualTree(plan[0].nodes, student);

    return new Promise((resolve, reject)=>{
        resolve(tree);
    })
}


/* 
 Transcribe the tree from schema to usable data. Include class name and children only.
 Parameters: the plannode tree.
 Returns: a tree with only class name and children. 
 */
getSanitizedTree = function(tree){
    var queue = tree;
    var discovered =[];
    var newTree = {};

    sanitizedTreeRecurHelper(queue, discovered, newTree);

    newTree = genTree(Object.values(newTree), "id", "parents");

    return newTree;
}

sanitizedTreeRecurHelper = function(queue, discovered, newTree){
    if(!queue.length){
        return;
    }
    let tree = queue.shift();

    if(!newTree[tree.class.name]&&tree.class.name!="root"){
        newTree[tree.class.name] = {name:tree.class.name, id:tree.id, parents:[]};
    }

    for(let child of tree.children){
        if(!newTree[child.class.name]){
            newTree[child.class.name] = {name:child.class.name, id:child.id, parents:[tree.id]};
        }else{
            newTree[child.class.name].parents.push(tree.id);
        }
        if(!discovered[child.id]){
            discovered[child.id]= true;
            queue.push(child);
        }
    }
    sanitizedTreeRecurHelper(queue, discovered, newTree);
}

/*
From https://stackoverflow.com/questions/444296/how-to-efficiently-build-a-tree-from-a-flat-structure
Updated to allow multiple parent nodes.

*/
genTree = function(treeData, key, parentKey){
    var keys = [];
    treeData.map(function(x){
        x.children = [];
        keys.push(x[key]);
    });
    var roots = treeData.filter(function(x){
        let arr = x[parentKey]
        return arr.every(e=>keys.indexOf(e)==-1)
    });
    var nodes = [];
    roots.map(function(x){nodes.push(x)});
    while(nodes.length > 0)
    {
        var node = nodes.pop();
        var children =  treeData.filter(function(x){
            return x[parentKey].includes(node[key])
        });
        children.map(function(x){
            if(!node.children.includes(x)){
                node.children.push(x);
            }
            nodes.push(x)
        });
    }
    if (roots.length==1) return roots[0];
    return roots;
}

 /* 
 Returns two sets of data, a list of nodes and a list of edges between nodes. Keeping until I settle on a graphics library.
 Parameters: The list of plannodes, top level.
 Returns: Two sets of data.
 */
returnVisualTree = async function(planNodes, student){
    var nodes = [];
    var edges = [];
    var nextLevel = [];
    var map = {};
    var i = 0;
    while(planNodes&&planNodes.length){
        nextLevel = [];
        const curNodes = await PlanNode.find({'_id':{$in:planNodes}}).exec(); // Get the list of nodes for the array of ids.
        for(let curNode of curNodes){
            let childNodes = curNode.children; // Get all nodes that have a child of the current node.
            if(!(curNode._id in map)){
                map[curNode._id] = i;
                i= i+1;
            }
            for(let edge of childNodes){
                if(!(edge._id in map)){
                    map[edge._id] = i;
                    i= i+1;
                }
                if(!edges.some(e=>e.from===map[edge._id]&&e.to===map[curNode._id])){
                    edges.push({from:map[edge._id], to:map[curNode._id], fixed:true});
                }
                nextLevel.push(edge._id);
            }
            if(!nodes.some(e=>e.id === map[curNode._id])){
                const classObj = await Class.findById(curNode.class).exec();
                if(ClassService.isCompleted(curNode, student)){
                    nodes.push({id:map[curNode._id], label:classObj.name, level:getDepth(curNode),color:"#111111", fixed:true});
                }else if(student.options.includes(curNode.id)){
                    nodes.push({id:map[curNode._id], label:classObj.name, level:getDepth(curNode), color:"#aaaaaa", fixed:true});
                }else{
                    nodes.push({id:map[curNode._id], label:classObj.name, level:getDepth(curNode), fixed:true});
                }
            }
        }
        planNodes = nextLevel;
    }

    return new Promise((resolve, reject)=>{
        resolve({edges:edges, nodes:nodes})
    })
}

getDepth = function(node){
    var level = 0;
    var queue = [node];
    var discovered = [];
    while(queue.length){
        let node = queue.shift();
        if(discovered[node.id]){
            continue;
        }
        level+=1;
        for(let child of node.children){
            if(!discovered[node.id]){
                discovered[node.id] = true;
                queue.push(child);
            }
        }
    }
    return level;
}

// Idea is to use the student information. The options we already generated, combined with the classes that they want to take, to generate a possible solution.
// If there is no solution then return nothing and will present to user with ?? modal? that there were no results.
// Will need to be completed after student has been plugged in.
module.exports.regenerateTree = async function(id, vals){
    const student = await Student.findById(id).exec();
    var options = student.options.filter(e=>vals.includes(e.toString()));

    for(let option in options){
        options[option] = await PlanNode.findById(options[option]).exec();
    }

    const plan = await generatePlan(options, student.desiredCredits);

    if(plan.length<student.semesterPlan.length){
        return {plan:plan, error:"Nothing to replace with"}
    }

    return plan;
}

module.exports.getPlans = async function(){
    return await Plan.find({}).exec();
}