var express = require('express');
var xlsx = require('xlsx');
var db = require('../db');
var planController = require("../controllers/planController");
var classController = require('../controllers/classController');

var router = express.Router();
db.getDb();

router.post("/addClass", async (req, res)=>{
    try{
        await classController.addClass(req.body.className, req.body.classRequirements, req.body.credits, req.body.equalClasses)
        res.send({success:true});
    }catch(err){
        res.send({success:false, err:err})
    }
});

router.post("/addPlan", (req, res)=>{

})

router.get("/getPlans", async (req, res)=>{
    res.send({plans: await planController.getPlans()})
})

module.exports = router;