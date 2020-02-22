var db = require('../db');
var uuid = require('uuid/v4');
const fs = require("fs");
var {config} = require("../config");
const {google} = require("googleapis");
const express = require("express")

const {Calendar} = require('../schema/calendar')

var router = express.Router();

router.get("/get", (req, res)=>{
    // Get current calendar for this student. If they have not logged in, prompt them to do so.
    // Load client secrets from a local file.
    const calendar = google.calendar({version: 'v3'});
    calendar.events.list({
        calendarId: req.query.id || 'primary',
        timeMin: (new Date()).toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
    }, (err, results) => {
        if (err) return console.log('The API returned an error: ' + err);
        res.json({items:results.data.items});
    });
});

module.exports = router;