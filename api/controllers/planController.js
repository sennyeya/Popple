var mongoose = require('mongoose');
var {Class} = require('../schema/class');
var {Requirement} = require('../schema/requirement');
var {Plan} = require('../schema/plan');
var {PlanNode} = require('../schema/planNode');
var {Student} = require('../schema/student');
var {Bucket} = require('../schema/bucket')
var ClassService = require('../services/classService');

/*
This method ties to an api hook, meant to retrieve the graphic version of the plan for the student.
*/
module.exports.retrievePlanGraph = function(studentId){
    return new Promise(async (resolve, reject)=>{
        var student = await Student.findById(studentId).exec();
        
        var nodes = [];
        for(let plan of student.plans){
            nodes = nodes.concat(plan.nodes);
            let filter = [];
            nodes = nodes.filter((e, i, arr)=>{
                if(filter.some(f=>f.id==e.id)){
                    return false;
                }
                filter.push(e);
                return true;
            })
        }
        var tree = await returnVisualTree(nodes, student);
        resolve(tree);
    })
}

 /* 
 Returns two sets of data, a list of nodes and a list of edges between nodes.
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
                if(!edges.some(e=>e.from===edge._id&&e.to===curNode._id)){
                    edges.push({source:edge._id, target:curNode._id});
                }
                nextLevel.push(edge._id);
            }
            if(!nodes.some(e=>e.id === map[curNode._id])){
                const classObj = await Class.findById(curNode.class).exec();
                let nodeInfo = {id:curNode._id, title:classObj.name}
                if(ClassService.isCompleted(curNode, student)){
                    nodes.push({...nodeInfo, type:"completed"});
                }else if(student.options.includes(curNode.id)){
                    nodes.push({...nodeInfo, type:"inProgress"});
                }else{
                    nodes.push({...nodeInfo, type:"toDo"});
                }
            }
        }
        planNodes = nextLevel;
    }

    return new Promise((resolve, reject)=>{
        resolve({edges:edges, nodes:nodes})
    })
}

module.exports.getPlans = async function(){
    return await Plan.find({}).exec();
}

module.exports.addPlans = async function(student, ids){
    return new Promise(async (res, rej)=>{
        var plans = [];
        for(let elem of ids){
            plans.push(elem.value)
        }
        student.plans = plans;

        Student.findOneAndUpdate({googleId:student}, {plans: plans}, (err, doc)=>{
            if(err){
                rej(err)
            }else{
                res()
            }
        })
    })
}

module.exports.updateSurvey = async function(student, ids){
    student.plans = ids.map(e=>e.value);
    student.lastAnsweredPlanSurvey = new Date();
    return await student.save();
}

module.exports.getPlanClasses = async function(student){
    let queue = [];
    for(let plan of student.plans){
        for(let node of plan.nodes){
            node = await PlanNode.findById(node).exec();
            queue.push(node)
        }
    }
    let data = findPlanNodeDependencies(queue);
    data = data.map(e=>e.class).map(e=>{
        return {label:e.name, value:e.id}
    }).sort((a, b)=>{
        if ( a.label < b.label ){
            return -1;
        }
        if ( a.label > b.label ){
            return 1;
        }
        return 0
    })
    return data;
}

/**
 * Return the Plan Node's full dependency list, includes all levels of tree.
 * @param {Array<PlanNode>} ids 
 */
const findPlanNodeDependencies = (ids) => {
    let visited = [];
    let data = [];
    let queue = [ids];
    while(queue.length){
        let node = queue.pop();
        if(visited.indexOf(node.id)!==-1){
            continue;
        }
        visited.push(node.id);
        data.push(node)
        queue = queue.concat(node.children)
    }
    return data;
}

module.exports.updateItemSurvey = async (student, ids) => {
    ids = ids.map(e=>e.value)
    ids = await Class.find({id:{$in:ids}}).exec();
    student.completedClasses = ids;
    student.lastAnsweredClassSurvey = new Date();
    return await student.save();
}

/**
 * Return the plan matching the passed in id.
 * @param {mongoose.Schema.Types.ObjectId} id
 * @returns {Document} plan matching passed in id
 */
module.exports.getItem = async (id) =>{
    return await Plan.findById(id).exec();
}

/**
 * Return the plan matching the passed in id.
 * @param {mongoose.Schema.Types.ObjectId} id
 * @returns {Array<Document>} array of classes matching passed in id
 */
module.exports.getClasses = async (id)=>{
    var classes = [];
    var plan = await Plan.findById(id).exec();
    for(let node of plan.nodes){
        // Get the class corresponding to each top level class in the plan.
        node = await PlanNode.findById(node).exec();
        let classNode = await Class.findById(node.class).exec();
        classes.push(classNode)
    }
    return classes;
}

/**
 * Created a new plan with the matching plan nodes.
 * @param {String} name name of new plan.
 * @param {Array<mongoose.Schema.Types.ObjectId>} requirements ids for required classes.
 * @returns {Document} plan matching passed in id
 */
module.exports.addPlan = async (name, requirements)=>{
    var nodes = [];
    for(let req of requirements){
        // Create or find the plan nodes that correspond the requirement ids.
        let [node] = await PlanNode.find({class:req}).exec();
        if(!node){
            node = await PlanNode.create({class:req, children:[]})
        }
        nodes.push(node.id);
    }
    await Plan.create({name:name, nodes:nodes})
}

/**
 * Update the plan with the new name and requirements.
 * @param {mongoose.Schema.Types.ObjectId} id plan id
 * @param {String} name plan name
 * @param {Array<mongoose.Schema.Types.ObjectId>} requirements list of classes
 */
module.exports.updatePlan = async (id, name, requirements) =>{
    var nodes = [];
    for(let req of requirements){
        let [node] = await PlanNode.find({class:req}).exec();
        if(!node){
            node = await PlanNode.create({class:req, children:[]})
        }
        nodes.push(node.id);
    }
    await Plan.findByIdAndUpdate(id, {name:name, nodes:nodes}).exec();
}

/**
 * Generates a full 8 semesters of buckets.
 * @param {Array<Document>} buckets 
 * @param {ObjectId} studentId 
 */
const generateBuckets = async (buckets, studentId)=>{
    var array = [...buckets]
    // Ensure that there are 8 semesters worth of buckets in the passed in list.
    if(buckets.length<9){
        for(let diff = buckets.length-1;diff<8;diff++){
            let bucket = new Bucket();
            bucket.studentId = studentId;
            bucket.name = `Semester ${diff+1}`;
            bucket.nodes = [];
            bucket = await bucket.save();
            array.push(bucket)
        }
    }
    return array
}

/**
 * Retrieve a user's bucket items.
 * @param {mongoose.Schema.Types.ObjectId} id student id
 * @returns {Array<Document>} array of bucket items, essentially plan nodes with a bucket property.
 */
module.exports.retrieveBucketItems = async (id) =>{
    let buckets = await Bucket.find({studentId:id}).populate({path:'nodes', populate:{path:'class', model:'planNode'}}).sort({name:1}).exec();
    // By default, create a single new bucket.
    if(buckets.length==0){
        let arr = [];
        let student = await Student.findById(id).exec();
        let bucket = new Bucket();
        bucket.studentId = id;
        bucket.name = "";
        bucket.nodes = [];
        bucket = await bucket.save();
        for(let plan of student.plans){
            plan = await Plan.findById(plan)
            for(let elem of plan.nodes){
                elem.bucket = bucket.id
                arr.push(elem)
            }
        }
        arr = arr.reduce((unique, item)=>unique.includes(item)?unique:[...unique, item], [])
        // Add all nodes from plan into first bucket.
        let filled = [];
        while(arr.length){
            let item = arr[0]
            item = await PlanNode.findById(item)
            filled.push(item)
            arr = arr.slice(1)
            arr = arr.concat(item.children.map(e=>{e.bucket = item.bucket; return e;}))
        }
        filled = filled.reduce((unique, item)=>unique.some(e=>e.id===item.id)?unique:[...unique, item], [])
        bucket.nodes = filled;
        buckets = [await bucket.save()]
    }

    buckets = await generateBuckets(buckets, id);

    // Get all nodes from buckets.
    let data = []
    for(let bucket of buckets){
        for(let item of bucket.nodes){
            item.bucket = bucket
            data.unshift(item)
        }
    }

    return data.sort(function order(key1, key2) { 
        if (key1.class.name < key2.class.name) return -1; 
        else if (key1.class.name > key2.class.name) return +1; 
        else return 0; 
    });;
}

/**
 * Retrieve a user's buckets.
 * @param {ObjectId} id StudentID
 */
module.exports.retrieveBuckets = async (id) =>{
    return await Bucket.find({studentId:id}).sort({name:1}).exec();
}

/**
 * Update the passed in bucket with the new item and remove the item from its old bucket.
 * @param {mongoose.Schema.Types.ObjectId} id student id
 * @param {mongoose.Schema.Types.ObjectId} bucket bucket id
 * @param {mongoose.Schema.Types.ObjectId} item item id
 */
module.exports.updateBucket = async (id, bucket, item) =>{
    await Bucket.findOneAndUpdate({
        studentId:id, nodes:item
    },{
        $pull:{nodes:item}
    }).exec();
    await Bucket.findByIdAndUpdate(bucket,{
        $push:{nodes:item}
    }).exec();
}

module.exports.getBucketItemInfo = async (student, id) =>{
    let node = await PlanNode.findById(id).exec();
    return {name:node.class.name, credits:node.class.credits, planProgress:0, graduationProgress:0};
}