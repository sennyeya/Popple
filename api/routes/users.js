var express = require('express');
var db = require('../db');
var uuid = require('uuid/v4');

var {Class} = require('../schema/class');

var router = express.Router();

/* GET users listing. */
router.get('/test', function(req, res, next) {
  res.send({name:"Aramis"});
});

router.get('/all', function(req, res, next) {
  res.send({name:"test"});
});

module.exports = router;
