var db = require('../db');
var uuid = require('uuid/v4');
const fs = require("fs");
var {config} = require("../config");
const express = require("express");

const {Calendar} = require('../schema/calendar');

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
    res.send(await calendarRepo.getUserCalendars());
})

router.get("/getLocalOptions", async (req, res)=>{
    res.send((await calendarRepo.getLocalCalendarOptions(req.user.id)).map((e,i)=>{return {value:e.id, label:e.name, key:i}}));
})

module.exports = router;