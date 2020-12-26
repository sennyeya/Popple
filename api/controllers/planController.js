var mongoose = require('mongoose');
var {Class} = require('../schema/class');
var {Requirement} = require('../schema/requirement');
var {Plan} = require('../schema/plan');
var {PlanNode} = require('../schema/planNode');
var {Student} = require('../schema/student');
var {Bucket} = require('../schema/bucket')
var ClassService = require('../services/classService');
const { Flag, flags } = require('../schema/flag');
const { BucketItem } = require('../schema/bucketItem');

/*
This method ties to an api hook, meant to retrieve the graphic version of the plan for the student.
*/
/**
 * @deprecated Uses old version of plan model.
 * @param {*} student 
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
    return {edges, nodes};
}

/**
 * New method to get the requirement graph, which is both plan level requirements (class -> class),
 *  and plan node level requirements (grade level requirements, C_OR_BETTER, etc).
 * @param {*} student 
 */
module.exports.getRequirementGraph = async function(student){
    let plans = await Plan.find({'_id':{$in:student.plans}}).populate({
        path: 'nodes',
        populate:{	
            path: 'flags'
        }
    }).populate('requirements').exec();
    let classes = []
    let edges = [];

    for(let plan of plans){
        for(let node of plan.nodes){
            if(node.classes){
                classes = classes.concat(node.classes)
            }
            if(node.flags){
                for(let flag of node.flags){
                    edges = edges.concat(node.classes.map(classId=>{
                        return {
                            source:flag.requirement,
                            target:classId
                        }
                    }))
                }
            }
        }
        for(let req of plan.requirements){
            edges.push({
                source:req.from,
                target:req.to
            })
        }
    }
    classes = await Class.find({'_id':{$in:classes}}).sort({name:1}).exec();
    let nodes = classes.map(e=>{
        return {id:e._id, title:e.name, type:"toDo"}
    });
    return {edges, nodes}
}

/**
 * Return all plans in the system.
 */
module.exports.getPlans = async function(){
    return await Plan.find({}).exec();
}

/**
 * @deprecated.
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

const classList = {
    "CSC101":{
        name:"Intro to Computer Science",
        credits:4,
        requires:[]
    },
    "CSC127A":{
        name:"Intro Computer Science",
        credits:4,
        requires:[]
    },
    "CSC110":{
        name:"Intro to Computer Programming I",
        credits:4,
        requires:[]
    },
    "CSC120":{
        name:"Intro to Computer Programming II",
        credits:4,
        requires:[
            "CSC127A"
        ]
    },
    "CSC210":{
        name:"Software Development",
        credits:4,
        requires:[
            "CSC120"
        ]
    },
    "CSC252":{
        name:"Computer Organization",
        credits:3,
        requires:[
            "CSC210"
        ]
    },
    "CSC335":{
        name:"Object-Ornt Prgm+Dsgn",
        credits:3,
        requires:[
            "CSC210"
        ]
    },
    "CSC352":{
        name:"System Programming+Unix",
        credits:3,
        requires:[
            "CSC210"
        ]
    },
    "CSC345":{
        name:"Analysis Discrete Struct ",
        credits:3,
        requires:[
            "CSC210"
        ]
    },
    "CSC245":{
        name:"Intro Discrete Structure",
        credits:4,
        requires:[
            "CSC120"
        ]
    },
    "CSC372":{
        name:"Comparative Programming Languages",
        credits:3,
        requires:[
            "CSC210"
        ]
    },
    "CSC422":{
        name:"Parallel Programming",
        credits:3,
        requires:[
            "CSC210",
            "CSC335"
        ]
    },
    "CSC460":{
        name:"Database Design",
        credits:3,
        requires:[
            "CSC210"
        ]
    },
    "CSC473":{
        name:"Automata,Grammars+Lang",
        credits:3,
        requires:[
            "CSC345"
        ]
    },
    "CSC445":{
        name:"Algorithms",
        credits:3,
        requires:[
            "CSC345"
        ]
    },
    "CSC452":{
        name:"Operating Systems",
        credits:3,
        requires:[
            "CSC252",
            "CSC352"
        ]
    },
    "CSC453":{
        name:"Compilers",
        credits:3,
        requires:[
            "CSC252",
            "CSC352"
        ]
    },
    "CSC433":{
        name:"Elective Class",
        credits:3,
        requires:[
            "CSC210"
        ]
    },
    "CSC436":{
        name:"Elective Class",
        credits:3,
        requires:[
            "CSC210"
        ]
    },
    "CSC437":{
        name:"Elective Class",
        credits:3,
        requires:[
            "CSC210"
        ]
    },
    "CSC444":{
        name:"Elective Class",
        credits:3,
        requires:[
            "CSC210"
        ]
    },
    "CSC447":{
        name:"Elective Class",
        credits:3,
        requires:[
            "CSC210"
        ]
    },
    "CSC450":{
        name:"Elective Class",
        credits:3,
        requires:[
            "CSC210"
        ]
    },
    "CSC466":{
        name:"Elective Class",
        credits:3,
        requires:[
            "CSC210"
        ]
    },
    "CSC477":{
        name:"Elective Class",
        credits:3,
        requires:[
            "CSC210"
        ]
    },
    "CSC483":{
        name:"Elective Class",
        credits:3,
        requires:[
            "CSC210"
        ]
    },
    "CSC425":{
        name:"Elective Class",
        credits:3,
        requires:[
            "CSC210"
        ]
    },
}

const findOrCreateClass = async (className) => {
    let classInfo = classList[className];
    if(!classInfo){
        throw new Error(`Class not found: ${className}`)
    }
    let name = className + ": "+classInfo.name
    let classObj = await Class.findOne({name}).exec();
    if(classObj){
        return classObj;
    }

    classObj = new Class({
        name,
        credits:className.credits
    });
    return await classObj.save();
}

const findOrCreateRequirement = async (from, to)=>{
    from = await findOrCreateClass(from)
    to = await findOrCreateClass(to)
    
    let req = await Requirement.findOne({from, to}).exec();
    if(req){
        return req;
    }

    req = new Requirement({
        from,
        to
    });
    return await req.save();
}

const getRequirements = async (className) =>{
    let classInfo = classList[className];
    if(!classInfo){
        throw new Error(`Class not found: ${className}`)
    }
    let reqs = []
    for(let req of classInfo.requires){
        reqs.push(await findOrCreateRequirement(req, className))
    }
    return reqs;
}

const parseSubstitutions = (arr) => {
    var dic = {};
    for(let elem of arr){
        let split = elem.split("~")
        let from = split[0]
        let to = split[1]
        dic[to] = from
    }
    return dic;
}

const createRequirement = async (name, classes, flags, minimumClasses = 0, substitutions) =>{
    let planNode = await PlanNode.findOne({name}).exec()
    if(planNode){
        return planNode;
    }

    //let subs = parseSubstitutions(substitutions);
    let flagArr = []
    for(let flag of flags){
        let relatedClass = await findOrCreateClass(flag.requirement);
        let flagObj = new Flag({requirement:relatedClass, type:flag.type});
        flagArr.push(await flagObj.save());
    }

    let classArr = []
    let reqs = []
    for(let className of classes){
        let classObj = await findOrCreateClass(className);
        reqs = reqs.concat(...await getRequirements(className));
        classArr.push(classObj);
    }

    planNode = new PlanNode({classes:classArr, flags:flagArr, name, minimumClasses});
    return [await planNode.save(), reqs];
}

module.exports.addCSCPlan = async () => {
    let groups = [
        await createRequirement(
            "Computer Science I",
            [
                "CSC127A"
            ],
            [
                /*{
                    type:flags.C_OR_BETTER,
                    requirement:"CSC101"
                }*/
            ]
        ),
        await createRequirement(
            "Computer Science II",
            [
                "CSC120"
            ],
            [
                /*{
                    type:flags.C_OR_BETTER,
                    requirement:"CSC110"
                }*/
            ]
        ),
        await createRequirement(
            "Software Development",
            [
                "CSC210"
            ],
            [
                {
                    type:flags.C_OR_BETTER,
                    requirement:"CSC120"
                }
            ]
        ),
        await createRequirement(
            "Major Core Curriculum",
            [
                "CSC252",
                "CSC335",
                "CSC345",
                "CSC352"
            ],
            [],
            4
        ),
        await createRequirement(
            "Introduction to Discrete Structures",
            [
                "CSC245"
            ],
            [
                {
                    type:flags.C_OR_BETTER,
                    requirement:"CSC120"
                }
            ]
        ),
        await createRequirement(
            "Paradigms Area Elective",
            [
                "CSC372",
                "CSC422",
                "CSC460"
            ],
            [],
            1
        ),
        await createRequirement(
            "Theory And Writing Area Elective",
            [
                "CSC445",
                "CSC473"
            ],
            [],
            1
        ),
        await createRequirement(
            "Systems Area Elective",
            [
                "CSC452",
                "CSC453"
            ],
            [],
            1
        ),
        await createRequirement(
            "Electives",
            [
                "CSC372", 
                "CSC422", 
                "CSC433", 
                "CSC436", 
                "CSC437", 
                "CSC444", 
                "CSC445", 
                "CSC447", 
                "CSC450", 
                "CSC452", 
                "CSC453", 
                "CSC460", 
                "CSC466", 
                "CSC473", 
                "CSC477", 
                "CSC483",
                "CSC425"
            ],
            [],
            2
        )
    ]
    console.log([].concat(...groups.map(e=>e[1])))
    let doc = await Plan.create({
        name:"CSC Major",
        nodes:groups.map(e=>e[0]),
        requirements:[].concat(...groups.map(e=>e[1]))
    })
    return doc._id;
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
    
    if(!buckets.length){
        let populatedPlans = await Plan.find({
            _id:{
                $in: student.plans
            }
        }).populate({
            path: 'nodes',
            populate:{
                path:'flags classes'
            }
        }).populate({
            path: 'requirements'
        }).exec()

        // Create the requirement map for the plans. Get each class's children.
        let reqMap = {}
        for(let plan of populatedPlans){
            for(let node of plan.nodes){
                if(node.flags){
                    for(let flag of node.flags){
                        node.classes.map(classId=>{
                            let req = {
                                from:flag.requirement, to:classId.id
                            }
                            if(reqMap[req.to]){
                                if(!reqMap[req.to].some(e=>e.toString()===req.from.toString())){
                                    reqMap[req.to].push(req.from)
                                }
                            }else{
                                reqMap[req.to] = req.from?[req.from]:[]
                            }
                        })
                    }
                }
            }
            for(let req of plan.requirements){
                if(reqMap[req.to]){
                    if(!reqMap[req.to].some(e=>e.toString()===req.from.toString())){
                        reqMap[req.to].push(req.from)
                    }
                }else{
                    reqMap[req.to] = req.from?[req.from]:[]
                }
            }
        }

        // Create the Plan Node buckets, ie the required classes.
        buckets = []
        for(let plan of populatedPlans){
            for(let elem of plan.nodes){
                let bucketElem = new Bucket({
                    name : "req-group:" +(elem.name ||""),
                    planNode: elem._id
                })
                bucketElem = await bucketElem.save();
                for(let classItem of elem.classes){
                    let bucketItem = new BucketItem({
                        currentBucket:bucketElem.id,
                        originalBucket:bucketElem.id,
                        classItem,
                        children:reqMap[classItem.id] || []
                    })
                    await bucketItem.save();
                }
                buckets.push(bucketElem.id)
            }
        }

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

    return await BucketItem.find({
        currentBucket:{
            $in:student.buckets
        }
    }).populate('classItem').exec();
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
    await BucketItem.findByIdAndUpdate(item,{
        currentBucket:to
    }).exec();
}

/**
 * Return the specific class information for a bucket item.
 * @param {Class} id 
 */
module.exports.getBucketItemInfo = async (id) =>{
    let item = await BucketItem.findById(id).exec();
    let node = await Class.findById(item.classItem).exec()
    return {name:node.name, credits:node.credits, planProgress:0, graduationProgress:0};
}