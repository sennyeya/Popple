const express = require("express");

const calendarRepo = require('../repositories/calendarRepo')

var router = express.Router();

router.post("/get", async (req, res)=>{
    // Get current calendar for this student. If they have not logged in, prompt them to do so.
    // Load client secrets from a local file.
    res.send(await calendarRepo.getItem(req.body.id))
});

router.get("/getList", async (req, res)=>{
    res.send(await calendarRepo.getAllCalendars(req.user.id));
});

router.get("/getOptions", async (req, res)=>{
    res.send((await calendarRepo.getUserCalendars()).map((e,i)=>{
        return {
            value:e.id, 
            label:e.summary, 
            key:i
        }
    }));
})

router.get("/getLocalOptions", async (req, res)=>{
    res.send((await calendarRepo.getLocalCalendarOptions(req.user.id)).map((e,i)=>{
        return {
            value:e.id, 
            label:e.name, 
            key:i
        }
    }));
})

router.post("/addCalendar", async (req, res)=>{
    for(let id of req.body.id){
        await calendarRepo.addCalendar(req.user.id, id)
    }
    res.status(201).send({})
})

router.post("/shareCalendar", async (req, res)=>{
    for(let id of req.body.id){
        await calendarRepo.shareCalendar(req.user.id, id);
    }
    res.status(201).send({})
})

module.exports = router;