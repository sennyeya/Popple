var express = require('express');
var xlsx = require('xlsx');
var PlanController = require('../controllers/planController');
var nlpController = require('../controllers/nlpController');
const classController = require('../controllers/classController');

var router = express.Router();

// router.get('/understand',async function(req, res){
//     var workbook = xlsx.readFile('/api/routes/testSheet.xlsx');
//     var data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

//     await nlpController.learn();
//     res.status(200).send();
// })

/**
 * Return a list of all plans.
 */
router.get('/plans', async function(req, res){
    res.send((await PlanController.getPlans()).map(elem=>{return {value:elem.id, label:elem.name}}))
})

/**
 * Return a list of all classes.
 */
router.get('/classes', async function(req, res){
    res.send((await classController.getClasses()).map(elem=>{return {value:elem.id, label:elem.name}}))
})

/**
 * Return the specific filled doc for the passed in ID.
 */
router.get('/class', async (req, res)=>{
    res.json(await classController.getItem(req.query.id))
})

module.exports = router;