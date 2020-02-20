var express = require('express');
var db = require('../db');
var uuid = require('uuid/v4');

var {Class} = require('../schema/class');

var router = express.Router();

/* GET users listing. */
router.get('/test', function(req, res, next) {
  res.send({name:"Aramis", id:"5d5b5b04fc3bbe43c4d5fc65"});
});

router.get('/all', function(req, res, next) {
  res.send({name:"test"});
});

router.get("/calendar", (req, res)=>{
  // Get current calendar for this student. If they have not logged in, prompt them to do so.
  
})

module.exports = router;
