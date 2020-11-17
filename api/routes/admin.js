var express = require('express');
var planController = require("../controllers/planController");
var classController = require('../controllers/classController');

var router = express.Router();

/**
 * Add a new class.
 */
router.post("/addClass", async (req, res)=>{
    try{
        await classController.addClass(req.body.className, req.body.classRequirements, req.body.credits, req.body.equalClasses)
        res.json({});
    }catch(err){
        res.status(400).json({err})
    }
});

router.post("/addPlan", (req, res)=>{

})

/**
 * Return the list of possible classes to choose.
 */
router.get("/classPicklist", async (req, res)=>{
    var classes = (await classController.getClasses()).map(e=>{
        return {value: elem.id, label:elem.name, credits:elem.credit}
    }).sort((a,b)=>{
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

/**
 * Return the list of possible plans to choose.
 */
router.get("/planPicklist", async (req, res)=>{
    res.send((await planController.getPlans()).map(e=>{return {value:e.id, label:e.name}}))
})

/**
 * Get details for a specific plan item.
 */
router.get("/getPlanItem", async (req,res)=>{
    res.send({item: await planController.getItem(req.query.id)})
})

/**
 * Return a list of all classes for a specific plan.
 */
router.get("/getClasses", async (req, res)=>{
    res.send((await planController.getClasses(req.query.id)).map((e,i)=>{return {value:e.id, label:e.name}}))
})

/**
 * Return the class item matching the passed in id.
 */
router.get("/getClassItem", async (req, res)=>{
    res.send({item: await classController.getItem(req.query.id)})
})

/**
 * Return a list of requirements, class->queryClass.
 */
router.get("/getRequirements", async (req, res)=>{
    var classes = await classController.getRequirements(req.query.id);
    res.send(classes.map((e, i)=>{return {value:e.id, label: e.name}}))
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