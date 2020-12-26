const {Class} = require("../schema/class");
const {Requirement} = require("../schema/requirement")
const {PlanNode} = require("../schema/planNode");
const {ObjectId} = require('mongoose/lib/types')

module.exports = {
    addClass: async function(className, classRequirements, credits, equalClasses){
        var reqs = []
        var doc = await Class.create({name:className, credit:credits, requirements:[], relevantAlternatives:equalClasses});
        for(let req of classRequirements){
            let newReq = await Requirement.create({classTo:doc.id, classFrom:req});
            reqs.push(newReq.id)
        }
        await Class.findByIdAndUpdate(doc.id, {requirements:reqs}).exec()
    },

    updateClass: async function(id, name, reqs, credits, equalClasses){
        var current = await Class.findById(id).exec();
        var currentReqs = await Requirement.find({_id:{$in:current.requirements}}).exec();
        var toDelete = [];
        for(let val of currentReqs){
            if(!reqs.includes(val.classFrom.id)){
                toDelete.push(val.id)
            }
        }
        for(let val of toDelete){
            await Requirement.findByIdAndDelete(val).exec();
        }
        currentReqs = await Requirement.find({_id:{$in:current.requirements}}).exec();
        var toSave = [];

        var nodes = await PlanNode.find({class:id}).exec();
        var childNodes = [];
        for(let req of reqs){
            if(!currentReqs.some(e=>e.classFrom.id===req)){
                toSave.push((await Requirement.create({classFrom:req, classTo:id})).id);
            }else{
                toSave.push(currentReqs.filter(e=>e.classFrom.id===req)[0].id)
            }
            let [childNode] = await PlanNode.find({class:req}).exec();
            if(!childNode){
                childNode = await PlanNode.create({class:req, children:[]})
            }
            childNodes.push(childNode)
        }
        
        for(let node of nodes){
            await PlanNode.findByIdAndUpdate(node.id, {children:childNodes.map(e=>e.id)}).exec();
        }

        await Class.findByIdAndUpdate(id, {
            name: name, 
            requirements:toSave, 
            credits:credits, 
            relevantAlternatives:equalClasses
        }).exec()
    },

    getClasses: async function(){
        return await Class.find({}).exec()
    },

    getItem: async function(id){
        return await Class.findById(id).exec()
    },

    getPossibleRequirements: async function(id){
        var possible = await Requirement.find({classFrom:id}).exec();
        var options = await Requirement.find().exec();
        var classes = [];
        while(possible.length){
            classes = classes.concat(possible.map(e=>e.classTo.id));
            possible = await Requirement.find({classFrom:{$in:possible.map(e=>e.classTo.id)}}).exec();
        }
        var possible = await Requirement.find({classTo:id}).exec();
        while(possible.length){
            classes = classes.concat(possible.map(e=>e.classFrom.id))
            possible = await Requirement.find({classTo:{$in:possible.map(e=>e.classFrom.id)}}).exec()
        }
        var filtered = options.filter(e=>{
            return !(classes.includes(e.classTo.id))
        })
        var retVal = [];
        var alreadyPushed = [];
        for(let i =0;i<2;i++){
            for(let elem of filtered){
                let req = await Class.findById(elem.classTo.id).exec();
                if(!alreadyPushed.includes(req.id)){
                    retVal.push(req.id); // Add the first element id.
                }
                let reqs = [];
                for(let id of req.requirements){ // Loop through the requirements.
                    reqs.push(await Class.findById((await Requirement.findById(id).exec()).classFrom.id).exec())
                }
                retVal = retVal.filter(e=>{ // Filter based on 
                    return !reqs.some(f=>f.id===e);
                })
                alreadyPushed.push(req.id);
            }
        }
        return options.filter(e=>retVal.includes(e.classTo.id));
    },
}
