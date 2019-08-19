var mongoose = require('mongoose');
var config = require('./config');

var serverUri = config.dbString;
var _db;

module.exports.connect = ()=>{
    mongoose.connect(serverUri, {useNewUrlParser: true});

    var db = mongoose.connection;
    
    db.on('error', function(args){
        console.log(args)
    });
    db.once('open', function(){
        _db = db;
    });
}

module.exports.connectAndReturn = ()=>{
    return new Promise(function(resolve, reject){
        mongoose.connect(serverUri, {useNewUrlParser: true});

        var db = mongoose.connection;
        
        db.on('error', function(args){
            console.log(args)
            reject()
        });
        db.once('open', function(){
            connected = true;
            resolve(db);
        });
    })
}

module.exports.getDb = () =>{
    return _db;
}