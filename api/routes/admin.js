var express = require('express');
var xlsx = require('xlsx');
var db = require('../db');
var planController = require("../controllers/planController");
var classController = require('../controllers/classController');

var router = express.Router();
db.getDb();

router.get("/isAdmin", (req, res)=>{
    if(!req.user.isAdmin){
        res.status(401).json({message:"UNAUTHORIZED"})
    }
    res.json({authorized: true})
})

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

router.get("/classPicklist", async (req, res)=>{
    var classes = []
    for(let elem of await classController.getClasses()){
        classes.push({value: elem.id, label:elem.name})
    }
    res.send({classes:classes})
})

router.get("/planPicklist", async (req, res)=>{
    var plans = []
    for(let elem of await planController.getPlans()){
        plans.push({value: elem.id, label:elem.name})
    }
    res.send({plans:plans})
})

router.get("/getPlanItem", async (req,res)=>{
    res.send({item: await planController.getItem(req.query.id)})
})

router.get("/getClassItem", async (req, res)=>{
    res.send({item: await classController.getItem(req.query.id)})
})

router.get("/getRequirements", async (req, res)=>{
    var reqs = (await classController.getRequirements(req.query.id)).map((e, i)=>{
        return {value: e.id, label: e.classFrom.name+"->"+e.classTo.name, key:i }
    })
    res.send(reqs)
})

module.exports = router;