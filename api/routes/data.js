var express = require('express');
var xlsx = require('xlsx');
var db = require('../db');
var PlanController = require('../controllers/planController');

var router = express.Router();

router.get('/load', async function(req, res, next){
    var workbook = xlsx.readFile('C:/Users/A/Popple/api/routes/testSheet.xlsx');
    var data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

    await db.connectAndReturn();
    await PlanController.loadClassesAndReqs(data[0]);
    res.status(200).send();
})

router.post('/generate/:credits', async function(req, res, next){
    if(isNaN(req.params.credits)){
        throw new Error('Invalid credit form, must be a number.');
    }else{
        await db.connectAndReturn();
        const plan = await PlanController.generateSemester(req.params.sId, req.params.credits);
        res.send({plan:plan});
    }
})

router.post('/plan/:name', async function(req, res, next){
    await db.connectAndReturn();
    const plan = await PlanController.retrievePlanGraph(req.params.name, req.params.sId);
    res.send({tree:plan})
})

module.exports = router;