var express = require('express')

var PlanController = require('../controllers/planController');

var router = express.Router();

router.get('/insertPlan', async (req, res)=>{
    res.send(await PlanController.addTestPlan());
});

router.get('/addCSCPlan', async (req, res)=>{
    res.send(await PlanController.addCSCPlan())
})

module.exports = router