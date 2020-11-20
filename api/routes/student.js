var express = require('express')

var {Student} = require('../schema/student');
var PlanController = require('../controllers/planController');
const classController = require('../controllers/classController');

var router = express.Router();

/**
 * Populate the student object or make one if they don't have one.
 */
router.use(async (req, res, next) => {
    if(!req.user){
        return res.status(401).json({})
    }else{
        let student = await Student.findOne({user:req.user.id}).exec();
        if(!student){
            student = new Student({
                name:req.user.displayName,
                user:req.user.id,
                lastAnsweredPlanSurvey:false,
                lastAnsweredClassSurvey:null
            });
            await student.save();
        }
        req.student = student;
        next();
    }
});

/**
 * Populate student's plan survey selections.
 */
router.post('/plan/survey', async (req, res)=>{
    try{
        await PlanController.updateSurvey(req.student, req.body.plans)
        res.json({});
    }catch(err){
        res.json({error: err})
    }
})

/**
 * Get the classes required for this student's plan.
 */
router.get('/requiredClasses', async (req, res)=>{
    return res.json(await PlanController.getPlanClasses(req.student))
})

/**
 * Populate student's class survey selections.
 */
router.post('/class/survey', async (req, res)=>{
    try{
        await PlanController.updateItemSurvey(req.student, req.body.classes)
        res.json({});
    }catch(err){
        res.json({error: err})
    }
})

const outsideCurrentSemester = (lastSurveyDate) =>{
    let currDate = new Date();
    let fallStart = new Date(currDate.getFullYear(), 8, 24, 0, 0, 0, 0);
    let fallEnd = new Date(currDate.getFullYear(), 12, 17, 0, 0, 0, 0)
    let springStart = new Date(currDate.getFullYear(), 1, 24, 0, 0, 0, 0);
    let springEnd = new Date(currDate.getFullYear(), 5, 17, 0, 0, 0, 0)
    if((lastSurveyDate > fallStart && 
        lastSurveyDate < fallEnd) || 
        (lastSurveyDate > springStart && 
            lastSurveyDate < springEnd)){
        return false;
    }
    return true;
}

/**
 * Ensure the student has answered the plan and class surveys.
 */
router.use(async (req, res, next)=>{
    if(outsideCurrentSemester(req.student.lastAnsweredPlanSurvey)){
        return res.json({error:"NO_VALID_PLAN_SURVEY",message:"This student has not answered a plan survey yet."})
    //}else if(outsideCurrentSemester(req.student.lastAnsweredClassSurvey)){
    //    return res.json({error:"NO_VALID_CLASS_SURVEY",message:"This student has not answered a class survey yet."})
    }
    next();
})

/**
 * Allow the student to add plans to their user.
 */
router.post('/plan/add', async (req, res)=>{
    try{
        await PlanController.addPlans(req.student, [req.body.id])
        res.json({});
    }catch(err){
        res.json({error: err})
    }
})

/**
 * Get the student's plan graph.
 */
router.get('/plan/tree', async (req, res)=>{
    const plan = await PlanController.retrievePlanGraph(req.student);
    res.json({tree:plan});
})

/**
 * Get a student's bucket items, mapped to buckets.
 */
 router.get('/bucket/items', async function(req, res){
    const buckets = await PlanController.retrieveBucketItems(req.student);
    res.json(buckets.map(e=>{
        return {id:e.id, label:e.name, bucket:e.bucket.id, children:e.children.map(e=>e._id), originalBucket:e.originalBucket}
    }));
})

/**
 * Returns the current user's buckets, planning and requirements.
 */
router.get('/bucket/buckets', async function(req, res){
    let buckets = await PlanController.retrieveBuckets(req.student);
    buckets = buckets.map(e=>{return {id:e.id, label:e.name}})
    res.json(buckets);
})

/**
 * Move an item to a new bucket.
 */
router.post('/bucket/move', async function(req, res){
    await PlanController.updateBucket(req.body.from, req.body.to, req.body.id)
    res.json({})
})

/**
 * Move an item to a new bucket.
 */
router.get('/bucket/itemInfo', async function(req, res){
    res.json(await PlanController.getBucketItemInfo(req.query.id))
})

module.exports = router;