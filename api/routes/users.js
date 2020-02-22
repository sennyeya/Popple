var express = require('express');
var db = require('../db');
var uuid = require('uuid/v4');
const fs = require("fs");
var {config} = require("../config");
const {google} = require("googleapis")

const {Calendar} = require('../schema/calendar');
const {Student} = require('../schema/student')

var router = express.Router();

/* GET users listing. */
router.get('/current', function(req, res, next) {
  Student.findOne({googleId: req.user.googleId}).then((doc)=>{
    res.send({
      name:doc.name, 
      id:doc.id
    });
  })
});

module.exports = router;
