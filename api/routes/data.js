var express = require('express');
var xlsx = require('xlsx');
var db = require('../db');
var PlanController = require('../controllers/planController');
var nlpController = require('../controllers/nlpController');

var router = express.Router();
db.getDb();

/*
This method handles a fake data test load.
*/
router.get('/load', async function(req, res, next){
    var workbook = xlsx.readFile('/api/routes/testSheet.xlsx');
    var data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

    await PlanController.loadClassesAndReqs(data[0]);
    res.status(200).send();
})

router.get('/understand',async function(req, res, next){
    var workbook = xlsx.readFile('/api/routes/testSheet.xlsx');
    var data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

    await nlpController.learn();
    res.status(200).send();
})

router.post('/generate', async function(req, res, next){
    if(!req.body.sId){
        res.sendStatus(500);
        return;
    }
    try{
        const plan = await PlanController.generateSemester(req.body.sId);
        res.send({plan:plan});
    }catch(err){
        console.log(err)
        res.send({error:err.message});
    }
})

/*
This method creates a plan for the passed in name of the plan.
*/
router.post('/plan', async function(req, res, next){
    const plan = await PlanController.retrievePlanGraph(req.body.sId);
    res.send({tree:plan});
})

/*
This method regenerates the tree for the student, taking into account the classes they didn't want to take.
*/
router.post('/regenerate', async function(req, res, next){
    const plan = await PlanController.regenerateTree(req.body.sId, req.body.vals);
    if(plan.error){
        res.send({error:plan.error})
    }else{
        res.send({plan:plan})
    }
})

/**
 * Return a list of all plans.
 */
router.get('/plans', async function(req, res){
    const plans = [];
    for(let elem of await PlanController.getPlans()){
        plans.push({value:elem.id, label:elem.name})
    }
    res.send({plans:plans})
})

/**
  * This method creates a plan for the passed in name of the plan.
  */
router.post('/bucketItems', async function(req, res, next){
    const buckets = await PlanController.retrieveBucketItems(req.body.sId);
    let retVal = buckets.map(e=>{
        return {id:e.id, label:e.class.name, bucket:e.bucket.id, children:e.children.map(e=>e.id)}
    })
    res.json(retVal);
})

router.post('/buckets', async function(req, res, next){
    let buckets = await PlanController.retrieveBuckets(req.body.sId);
    buckets = buckets.map(e=>{
        return {id:e.id, label:e.name}
    })
    res.json(buckets);
})

router.put('/bucket/:id', async function(req, res){
    await PlanController.updateBucket(req.params.id, req.body.bucket, req.body.item)
    res.status(201)
})

module.exports = router;