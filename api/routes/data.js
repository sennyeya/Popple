var express = require('express');
var xlsx = require('xlsx');
var db = require('../db');
var PlanController = require('../controllers/planController');

var router = express.Router();
db.getDb();

router.get('/load', async function(req, res, next){
    var workbook = xlsx.readFile('C:/Users/A/Popple/api/routes/testSheet.xlsx');
    var data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

    await PlanController.loadClassesAndReqs(data[0]);
    res.status(200).send();
})

router.post('/generate/', async function(req, res, next){
    const plan = await PlanController.generateSemester(req.body.sId);
    res.send({plan:plan});
})

router.post('/plan/:name', async function(req, res, next){
    const plan = await PlanController.retrievePlanGraph(req.params.name, req.body.sId);
    res.send({tree:plan});
})

router.post('/regenerate', async function(req, res, next){
    const plan = await PlanController.regenerateTree(req.body.sId, req.body.vals);
    if(plan.error){
        res.send({error:plan.error})
    }else{
        res.send({plan:plan})
    }
})

module.exports = router;