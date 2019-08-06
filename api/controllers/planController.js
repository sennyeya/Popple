var mongoose = require('mongoose');
var {Class} = require('../schema/class');
var {Requirement} = require('../schema/requirement');
var {UnmappedReq} = require('../schema/unmapped');
var {Plan} = require('../schema/plan');
var {PlanNode} = require('../schema/planNode');
var {Student} = require('../schema/student');

module.exports.loadClassesAndReqs = function(value){
    var classObj = new Class({
        name:value.name,
        credit:3
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
        
        Requirement.find({}).populate('classTo').exec(async function(err, reqs){
            var parentNodes = [];
            for(var elem in reqs){
                loop:{
                    for(var otherElems in reqs){
                        if(reqs[elem].classTo._id.equals(reqs[otherElems].classFrom._id)){
                            break loop;
                        }
                    }
                    parentNodes.push(reqs[elem].classTo._id)
                }
            }
            var topNodes = parentNodes.map(e=>e._id);
            var bottomNodes;
            
            var pastVals = []
            while(parentNodes.length>0){
                parentNodes = parentNodes.filter(e=>{
                    if(!pastVals.includes(e)){
                        pastVals.push(e);
                        return true;
                    }
                    return false;
                })
                pastVals = pastVals.concat(parentNodes);
                var set = [...new Set(parentNodes)];
                bottomNodes = set;
                parentNodes = await getParentNodes(set);
                await tryMerge([...new Set(parentNodes)]);
            }

            console.log(topNodes.length+" : "+bottomNodes.length)

            var topPlanNodes = await PlanNode.find({'class':{$in:topNodes}}).exec();
            topPlanNodes = topPlanNodes.map(e=>e._id);

            var bottomPlanNodes = await PlanNode.find({'class':{$in:bottomNodes}}).exec();
            bottomPlanNodes = bottomPlanNodes.map(e=>e._id);

            Plan.find({name:"CSC"}, function(err, result){
                if(result&&result.length){
                    Plan.findOneAndUpdate({name:"CSC"},{bottomNodes:bottomPlanNodes, topNodes:topPlanNodes},function(err, res){
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
};

tryMerge = async function(set){
    for(let parentClass of set){
        const nodes = await PlanNode.find({'class':parentClass.toString()}).exec();
        if(nodes&&nodes.length>1){
            var arr = [];
            for(let node of nodes){
                for(let par of node.parents){
                    if(!arr.includes(par._id)){
                        arr.push(par._id)
                    }
                }
            }

            const newSingle = await PlanNode.findOneAndUpdate({'_id':nodes[0]._id}, {parents:arr}).exec();
            nodes.shift();
            await PlanNode.deleteMany({'_id':{$in:nodes}})
        }
    }
}

getParentNodes = async function(set){
    const classSet = await Class.find({'_id':{$in:set}}).populate('requirements').exec();

    var arr = [];
    for(let elem of classSet){
        for(let req of elem.requirements){
            if(!arr.includes(req)){
                arr.push(req);
            }
        }
    }

    return new Promise(async (resolve, reject)=>{
        var mappedVals = arr.map(async req=>{
            const classFrom = await Class.findById(req.classFrom).exec();

            if(classFrom){
                const corClasses = await PlanNode.find({'class':classFrom._id}).exec();
                const parentClass = await Class.findById(req.classTo).exec();
                console.log("from "+classFrom.name+" to "+parentClass.name)

                if(corClasses&&corClasses.length){
                    if(parentClass){
                        console.log("updating "+corClasses[0].class.name)
                        var node = corClasses[0];
                        var parentNode = await PlanNode.find({'class':parentClass._id}).exec();
                        if(!parentNode||!parentNode.length){
                            parentNode = await addParentNode(parentClass);
                        }else{
                            parentNode = parentNode[0]
                        }
                        await updatePlanNode(node, parentNode._id);
                        return classFrom._id;
                    }
                }else{
                    if(parentClass){
                        const parentNode = await addParentNode(parentClass);

                        console.log("adding node for "+ classFrom.name)

                        var planNode = new PlanNode({
                            class:classFrom._id,
                            parents:[parentNode._id]
                        });
                        planNode.parents.filter(Boolean)

                        const checkAgain = await PlanNode.find({'class':classFrom._id}).exec();
                        console.log("testing again "+checkAgain.length)
                        if(checkAgain&&checkAgain.length){
                            await updatePlanNode(checkAgain[0], parentNode._id)
                        }else{
                            await planNode.save();
                        }
                        return classFrom._id;
                    }
                }
            }
        })

        mappedVals = await Promise.all(mappedVals);
    
        resolve([].concat.apply([], mappedVals))
    })
}

updatePlanNode = async function(node, id){
    var discovered = [];
    var parents = []
    parents = node.parents.filter(e=>{
        if(!discovered.includes(e._id)){
            discovered.push(e._id);
            return true;
        }
        return false;
    });

    parents = parents.map(e=>e._id);

    if(parents.includes(id)){
        return;
    }
    parents.push(id);
    console.log(parents)

    await PlanNode.findByIdAndUpdate(node._id, {parents:parents}).exec();
}

addParentNode = async function(classObj){
    var planNode = await PlanNode.findOne({'class':classObj._id}).exec();
    if(planNode){
        return planNode._id;
    }

    console.log("adding parent node for "+classObj.name)
    planNode = new PlanNode({
        class:classObj._id,
        parents:[]
    })
    return await planNode.save();
}

module.exports.generateSemester = async function(id, credits){
    // Load student. TODO
    // const planIds = await Student.findbyId(id).exec();
    var planIds = "CSC";
    var student = {plan:"CSC", completedClasses:["CSC110", "CSC120", "CSC210"]}

    var plan = await Plan.find({'name':planIds}).exec();

    var tree = {name:"root", parents:[]};
    for(let bottomNode of plan[0].bottomNodes){
        tree.parents.push(await PlanNode.findById(bottomNode).exec());
    }

    const options = await returnOptions(student, tree);

    plan = await generatePlan(options, credits);

    return new Promise((resolve, reject)=>{
        resolve(plan);
    })
}

addNode = function(tree, nodeToFind, obj){
    var stack = tree.children.map(e=>e);
    while(stack&&stack.length){
        tree = stack.shift();

        if(containsNode(tree, obj.id)){
            continue;
        }

        if(tree.id.equals(nodeToFind)){
            tree.children.push(obj);
            return;
        }else{
            for(let child of tree.children){
                if(!stack.some(e=>e.id.equals(child.id))){
                    stack.unshift(child);
                }
            }
        }
    }
}

containsNode = function(tree, id){
    var stack = tree.children.map(e=>e);
    while(stack&&stack.length){
        tree = stack.shift();

        if(tree.id.equals(id)){
            return true;
        }else{
            for(let child of tree.children){
                stack.push(child);
            }
        }
    }
    return false;
}

returnAllOptions = async function(student, tree){
    var queue = tree.children.map(e=>e);
    var completed = [];
    var options = [];
    while(queue&&queue.length){
        tree = queue.shift();

        if(isValidClass(student, tree)){
            options.push(tree.id);
        }else if(!tree.children.length){
            options.push(tree.id);
        }else{
            for(let child of tree.children){
                if(!queue.some(e=>e.id.equals(child.id))&&!completed.some(e=>e.id.equals(child.id))){
                    queue.push(child);
                    completed.push(child);
                }
            }
        }
    }
    return options;
}

returnOptions = async function(student, tree){
    var options = [];
    var invalidParents = [];
    var queue = [tree];
    var discovered = {};
    await recurHelperOptions(student, tree, queue, discovered, options, invalidParents);
    return new Promise((resolve, reject)=>resolve(options));
}

recurHelperOptions = async function(student, tree, queue, discovered, options, invalidParents){
    if(!queue.length){
        return;
    }
    tree = queue.shift();
    console.log(tree);
    if(await isValidClass(student, tree, invalidParents)){
        if(!options.some(e=>e.nodeId == tree.id)){
            const planNode = await PlanNode.findById(tree.id).exec();
            options.push({nodeId:tree.id, classId:planNode.class._id, credits:3, name:planNode.class.name}); // TODO: Get the actual credit value.
        }
    }else{
        for(let parent of tree.parents){
            if(!discovered[parent.id]){
                discovered[parent.id]= true;
                queue.push(parent);
            }
        }
    }
    await recurHelperOptions(student, tree, queue, discovered, options, invalidParents);
}

isValidClass = async function(student, tree, invalidParents){
    if(tree.name == "root"){
        return false;
    }
    // Check to see if this parent based tree is valid.
    //      []
    //  []      []
    //      []
    // []   []  []
    // If this class hasn't been completed then return true;
    // We would not recurse up trees where the bottom nodes are not completed.
    if(student.completedClasses.indexOf(tree.class.name)==-1){
        if(invalidParents.indexOf(tree.class.name)==-1){
            let queue = [tree.parents],
                discovered = [];
            while(queue.length){
                let parents = queue.shift();
                parents.map(e=>invalidParents.push(e.class.name));
                for(let parent of parents){
                    if(!discovered[parent.parents]){
                        discovered[parent.parents] = true;
                        queue.push(parent.parents);
                    }
                }
                console.log(parents)
            }
            return true;
        }
    }
    return false;
}

populatePlanNodes = async function(nodes){
    return new Promise(async (resolve, reject)=>{
        var mappedVals = nodes.map(async node=>{
            const classObj = await Class.findById(node.classId).exec();
            return classObj // Or whatever format we are sending back for the text based semester plan.
        })

        mappedVals = await Promise.all(mappedVals);
    
        resolve(mappedVals)
    })
}

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

recurHelperPlan = async function(options, plan, credits, cushion){
    console.log(Math.abs(getCreditSum(plan)-credits))
    if(Math.abs(getCreditSum(plan)-credits)==cushion){
        return true;
    }
    for(let option of options){
        if((getCreditSum(plan)+option.credits)<=credits){
            plan.push(option)
            if(await recurHelperPlan(options.filter(e=>e!=option), plan, credits, cushion)){
                return true;
            }
            plan.pop(option);
        }
    }
    return false;
}

getCreditSum = function(plan){
    if(!plan||!plan.length){
        return 0;
    }

    var total = 0;
    for(let val of plan){
        total+=val.credits;
    }
    return total;
}

module.exports.retrievePlanGraph = async function(name){
    var plan = await Plan.find({'name':name}).exec();

    const tree = await returnVisualTree(plan[0].topNodes);

    return new Promise((resolve, reject)=>{
        resolve(tree);
    })
}

returnVisualTree = async function(planNodes){
    var nodes = [];
    var edges = [];
    var nextLevel = [];
    while(planNodes&&planNodes.length){
        nextLevel = [];
        const curNodes = await PlanNode.find({'_id':{$in:planNodes}}).exec(); // Get the list of nodes for the array of ids.
        for(let curNode of curNodes){
            let childNodes = await PlanNode.find({'parents':curNode._id}).exec(); // Get all nodes that have a parent of the current node.
            for(let edge of childNodes){
                if(!edges.some(e=>e.from.equals(edge._id)&&e.to.equals(curNode._id))){
                    edges.push({from:edge._id, to:curNode._id});
                }
                nextLevel.push(edge._id);
            }
            if(!nodes.some(e=>e.id.equals(curNode._id))){
                const classObj = await Class.findById(curNode.class).exec();
                nodes.push({id:curNode._id, label:classObj.name});
            }
        }
        planNodes = nextLevel;
    }

    return new Promise((resolve, reject)=>{
        resolve({edge:edges, nodes:nodes})
    })
}