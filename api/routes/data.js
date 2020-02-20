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

router.post('/generate/', async function(req, res, next){
    if(!req.body.sId){
        res.sendStatus(500);
    }
    try{
        const plan = await PlanController.generateSemester(req.body.sId);
        res.send({plan:plan});
    }catch(err){
        res.send({error:err.message});
    }
})

/*
This method creates a plan for the passed in name of the plan.
*/
router.post('/plan/:name', async function(req, res, next){
    const plan = await PlanController.retrievePlanGraph(req.params.name, req.body.sId);
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

module.exports = router;