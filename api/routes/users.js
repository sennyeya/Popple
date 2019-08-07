var express = require('express');
var db = require('../db');
var uuid = require('uuid/v4');

var {Class} = require('../schema/class');

var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send({name:"Aramis"});
});

router.get('/all', function(req, res, next) {
  res.send({name:"test"});
});

router.post('/add/:name', function(req, res, next){
  const callback = (connection)=>{
    //Class = connection.model('Classes', classSchema);

    console.log(req.params)
    var classObj = new Class({name:req.params.name,id:uuid()});
    console.log(classObj.name)

    classObj.save(function(err){
      console.log(classObj)
      if(err){
        throw new Error(err);
      }
      res.send({name:classObj.name})
    })
  }

  db.connect(callback);
})

module.exports = router;
