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
module.exports.retrievePlanGraph = async function(student){
    let plans = await Plan.find({'_id':{$in:student.plans}}).populate('requirements', 'requirements').exec();
    let nodes = (await getClassesFromPlans(student.plans)).map(e=>{
        return {id:e._id, title:e.name, type:"toDo"}
    });
    let reqs = []
    for(let plan of plans){
        reqs = reqs.concat(plan.requirements.map(e=>e.id));
    }
    let edges = (await Requirement.find({
        _id:{
            $in:reqs
        }
    })).map(e=>{
        return {source:e.from, target:e.to}
    })
    var tree = {edges, nodes};
    return tree;
}

/**
 * Return all plans in the system.
 */
module.exports.getPlans = async function(){
    return await Plan.find({}).exec();
}

/**
 * DEPRECATED.
 * @param {*} student 
 * @param {*} ids 
 */
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

/**
 * Update a student's plans to the passed in ids.
 * @param {Student} student 
 * @param {Array<String>} ids 
 */
module.exports.updateSurvey = async function(student, ids){
    student.plans = ids.map(e=>e.value);
    student.lastAnsweredPlanSurvey = new Date();
    return await student.save();
}

/**
 * Get a picklist for the classes in a student's plans.
 * @param {Student} student 
 */
module.exports.getPlanClasses = async function(student){
    let classes = await getClassesFromPlans(student.plans);
    return classes.map(e=>{
        return {label:e.name, value:e.id}
    });
}

/**
 * Return a list of all classes that are found in each plan node.
 * @param {Array<Plan>} plans 
 */
const getClassesFromPlans= async (plans)=>{
    let planNodes = (await Plan.find({'_id':{$in:plans}}).populate('nodes').exec()).map(e=>e.nodes);
    let classes = []
    for(let plan of planNodes){
        for(let node of plan){
            if(node._doc.classes){
                classes = classes.concat(node._doc.classes)
            }
        }
    }
    classes = await Class.find({'_id':{$in:classes}}).sort({name:1}).exec();
    return classes;
}

/**
 * Generate a random class name at the desired level, ie level 4 is 400 level classes.
 * @param {Number} level 
 */
const generateRandomName = (level) =>{
    const alphabet = 'abcdefghijklmnopqrstuvwxyz'.toUpperCase().split("")
    let str = ""
    for(let i =3;i>0;i--){
        str+= alphabet[getRandomInt(0, alphabet.length-1)]
    }
    if(level){
        str+= getRandomInt(level*100, (level+1)*100)
    }
    return str;
}

/**
 * Generate a random int in the range [from, to].
 * @param {Number} from 
 * @param {Number} to 
 */
const getRandomInt = (from, to) =>{
    return Math.floor((Math.random()*(to-from))+from)
}

/**
 * Return a random element from the passed in array.
 * @param {Array<Object>} arr 
 */
const getRandomClass = (arr) =>{
    return arr[getRandomInt(0, arr.length-1)]
}

/**
 * Create count number of random classes.
 * @param {Number} count 
 */
const createRandomClasses = async (count) =>{
    let classes = [];
    while(count>0){
        classes.push({
            name:generateRandomName(count)
        })
        count--;
    }
    return await Class.insertMany(classes);
}

/**
 * Generate count nummber of random requirements for the passed in classes.
 * @param {Array<Object>} classes 
 * @param {Number} count 
 */
const createRandomRequirements = async (classes, count) =>{
    let reqs = [];
    while(count>0){
        reqs.push({
            from: getRandomClass(classes),
            to: getRandomClass(classes)
        })
        count--;
    }
    return await Requirement.insertMany(reqs);
}

/**
 * Generate numClasses number of classes and numReqs number of requirements,
 *  and tie those to a new PlanNode.
 * @param {Number} numClasses 
 * @param {Number} numReqs 
 */
const createRandomPlanNode = async (numClasses, numReqs) =>{
    let classes = await createRandomClasses(numClasses);
    let reqs = await createRandomRequirements(classes, numReqs);
    return {
        node:await PlanNode.create({
            name:generateRandomName(),
            classes
        }),
        reqs
    }
}

/**
 * Create a new Plan for testing with random classes and requirements.
 */
module.exports.addTestPlan = async () =>{
    let nodes = [];
    let reqs = [];
    let i = 7;
    while(i>0){
        let obj = await createRandomPlanNode(getRandomInt(1, 15), getRandomInt(1, 5));
        nodes.push(obj.node);
        reqs = reqs.concat(obj.reqs);
        i--;
    }
    let doc = await Plan.create({
        name:"TEST",
        nodes:nodes,
        requirements:reqs
    })
    return doc._id;
}

/**
 * Update the student's completed classes.
 * @param {Student} student 
 * @param {Array<String>} ids 
 */
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
 * Retrieve a user's bucket items.
 * @param {mongoose.Schema.Types.ObjectId} id student id
 * @returns {Array<Document>} array of bucket items, essentially plan nodes with a bucket property.
 */
module.exports.retrieveBucketItems = async (student) =>{
    let buckets = await Bucket.find({
        _id:{
            $in:student.buckets
    }}).populate({
        path:'nodes'
    }).sort({name:1}).exec();
    
    if(buckets.length==0){
        let arr = [];
        for(let plan of student.plans){
            plan = await Plan.findById(plan).populate('nodes').exec()
            arr = arr.concat(plan.nodes)
        }
        // Create the Plan Node buckets, ie the required classes.
        let nodeBuckets = []
        for(let elem of arr){
            nodeBuckets.push({
                name : "req-group:" +(elem.name ||""),
                nodes : elem.classes,
                planNode: elem._id
            })
        }
        let buckets = Object.values((await Bucket.collection.insertMany(nodeBuckets)).insertedIds);

        // Will want to use student choices here, but for now set to default value.
        let numSemesters = 8;
        let enrolledSemesters = ["Fall" , "Spring"];

        // Offset to start from?
        let currentStanding = 0;
        let startingYear = (new Date()).getFullYear() - currentStanding;

        // Creat the buckets for each semester in the 4 year plan.
        let semesterBuckets = []
        for(let i = 0;i<numSemesters;i++){
            let currentSemester = enrolledSemesters[i%enrolledSemesters.length];
            let isStudentEnrolledInWinter = enrolledSemesters.indexOf('Winter') > -1;
            semesterBuckets.push({
                name: currentSemester+" "+startingYear
            })
            if(currentSemester === "Fall"){
                if(!isStudentEnrolledInWinter){
                    startingYear++;
                }
            }else if(currentSemester === "Winter"){
                startingYear++;
            }
        }

        buckets = buckets.concat(Object.values((await Bucket.collection.insertMany(semesterBuckets)).insertedIds));
        student.buckets = buckets;
        await student.save();
    }

    let populatedPlans = await Plan.find({
        _id:{
            $in: student.plans
        }
    }).populate('requirements').populate('nodes').exec()

    // Create the requirement map for the plans. Get each class's children.
    let reqMap = {}
    for(let requirements of populatedPlans.map(e=>e.requirements)){
        for(let req of requirements){
            if(reqMap[req.to]){
                reqMap[req.to].push(req.from)
            }else{
                reqMap[req.to] = req.from?[req.from]:[]
            }
        }
    }
    let planNodes = populatedPlans.map(e=>e.nodes);
    let nodeIds = []
    for(let node of planNodes){
        nodeIds = nodeIds.concat(node.map(e=>e.id))
    }

    // Get the original bucket's for each node, ie the plan node with the class.
    let bucketMapping = await Bucket.find({planNode:{$in:nodeIds}}).exec();
    let bucketMap = {}
    for(let bucket of bucketMapping){
        bucketMap[bucket.planNode] = bucket.id;
    }
    let originalBucketMap = {}
    for(let nodes of populatedPlans.map(e=>e.nodes)){
        for(let node of nodes){
            for(let classObj of node.classes){
                originalBucketMap[classObj] = bucketMap[node.id];
            }
        }
    }

    // Get all nodes from buckets.
    let data = []
    for(let bucket of buckets){
        for(let item of bucket.nodes){
            item.bucket = bucket
            item.children = reqMap[item.id] || []
            item.originalBucket = originalBucketMap[item.id]
            data.unshift(item)
        }
    }

    return data
}

/**
 * Retrieve a user's buckets.
 * @param {Student} student student
 */
module.exports.retrieveBuckets = async (student) =>{
    let buckets =  await Bucket.find({_id:{
        $in: student.buckets
    }}).sort({name:1}).exec();

    const semesters = ["SPRING", "SUMMER", "FALL","WINTER"]

    return buckets.sort((a,b)=>{
        let strA = a.name.toUpperCase().split(" ")
        let strB = b.name.toUpperCase().split(" ")
        var semNameA = semesters.indexOf(strA[0]);
        var semNameB = semesters.indexOf(strB[0]);
        var numA = +strA[1]
        var numB = +strB[1]
        if(numA>numB){
            return 1;
        }else if(numB>numA){
            return -1;
        }else if(semNameA<semNameB){
            return -1;
        }else if(semNameA>semNameB){
            return 1;
        }else{
            return 0;
        }
    })
}

/**
 * Update the passed in bucket with the new item and remove the item from its old bucket.
 * @param {Student} student student
 * @param {mongoose.Schema.Types.ObjectId} bucket bucket id
 * @param {mongoose.Schema.Types.ObjectId} item item id
 */
module.exports.updateBucket = async (from, to, item) =>{
    await Bucket.findByIdAndUpdate(from,{
        $pull:{nodes:item}
    }).exec();
    await Bucket.findByIdAndUpdate(to,{
        $push:{nodes:item}
    }).exec();
}

/**
 * Return the specific class information for a bucket item.
 * @param {Class} id 
 */
module.exports.getBucketItemInfo = async (id) =>{
    let node = await Class.findById(id).exec();
    return {name:node.name, credits:node.credits, planProgress:0, graduationProgress:0};
}