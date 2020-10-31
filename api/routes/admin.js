var express = require('express');
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

router.get("/classPicklist", async (req, res)=>{
    var classes = []
    for(let elem of await classController.getClasses()){
        classes.push({value: elem.id, label:elem.name, credits:elem.credit})
    }
    classes = classes.sort((a,b)=>{
        var depNameA = a.label.substring(0, a.label.search(/[0-9]/));
        var depNameB = b.label.substring(0, b.label.search(/[0-9]/));
        var numA = +a.label.substring(a.label.search(/[0-9]/))
        var numB = +b.label.substring(b.label.search(/[0-9]/))
        if(depNameA<depNameB){
            return -1;
        }else if(depNameA>depNameB){
            return 1;
        }else if(numA>numB){
            return 1;
        }else if(numB>numA){
            return -1;
        }else{
            return 0;
        }
    })
    res.send(classes)
})

router.get("/planPicklist", async (req, res)=>{
    var plans = []
    for(let elem of await planController.getPlans()){
        plans.push({value: elem.id, label:elem.name})
    }
    res.send(plans)
})

router.get("/getPlanItem", async (req,res)=>{
    res.send({item: await planController.getItem(req.query.id)})
})

router.get("/getClasses", async (req, res)=>{
    res.send((await planController.getClasses(req.query.id)).map((e,i)=>{return {value:e.id, label:e.name, key:i}}))
})

router.get("/getClassItem", async (req, res)=>{
    res.send({item: await classController.getItem(req.query.id)})
})

router.get("/getRequirements", async (req, res)=>{
    var classes = await classController.getRequirements(req.query.id);
    res.send(classes.map((e, i)=>{return {value:e.id, label: e.name, key:i}}))
})

/*
router.get("/getRequirements", async (req, res)=>{
    var reqs;
    if(!req.query.id){
        res.send([]);
        return;
    }else{
        reqs = (await classController.getRequirements(req.query.id))
                .concat(await classController.getPossibleRequirements(req.query.id))
    }
    var labels = [];
    let i =0;
    for(let item of reqs){
        if(!labels.some(e=>e.id===item.classFrom.id)){
            labels.push({value: item.classFrom.id, label: item.classFrom.name, key:i })
            i++;
        }
        if(!labels.some(e=>e.id===item.classTo.id)){
            labels.push({value: item.classTo.id, label: item.classTo.name, key:i })
            i++;
        }
    }
    reqs = labels;
    var classes = [req.query.id];
    reqs = reqs.filter((e, i)=>{
        if(!classes.includes(e.value)){
            classes.push(e.value)
            return true;
        }
        return false
    })
    reqs = reqs.sort((a,b)=>{
                    var depNameA = a.label.substring(0, a.label.search(/[0-9]/));
                    var depNameB = b.label.substring(0, b.label.search(/[0-9]/));
                    var numA = +a.label.substring(a.label.search(/[0-9]/))
                    var numB = +b.label.substring(b.label.search(/[0-9]/))
                    if(depNameA<depNameB){
                        return -1;
                    }else if(depNameA>depNameB){
                        return 1;
                    }else if(numA>numB){
                        return 1;
                    }else if(numB>numA){
                        return -1;
                    }else{
                        return 0;
                    }
                })
    res.send(reqs)
})
*/

router.post('/saveClassItem', async (req, res)=>{
    if(req.body.id){   
        await classController.updateClass(req.body.id, req.body.name, req.body.requirements.map(e=>e.value), req.body.credits, []);
        res.send({success:true})
        return;
    }
    await classController.addClass(req.body.name, req.body.requirements.map(e=>e.value), req.body.credits, [])
    res.send({success:true})
})

router.post("/savePlanItem", async (req, res)=>{
    if(req.body.id){   
        await planController.updatePlan(req.body.id, req.body.name, req.body.requirements.map(e=>e.value), []);
        res.send({success:true})
        return;
    }
    await planController.addPlan(req.body.name, req.body.requirements.map(e=>e.value), [])
    res.send({success:true})
})

module.exports = router;