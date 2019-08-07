var mongoose = require('mongoose');
var config = require('./config');

var serverUri = config.dbString;
var connected = false;

module.exports.connect = (callback)=>{
    if(!connected){
        mongoose.connect(serverUri, {useNewUrlParser: true});

        var db = mongoose.connection;
        
        db.on('error', console.error.bind(console, 'connection error:'));
        db.once('open', function(){
            connected = true;
        });
    }
    callback(db);
}

module.exports.connectAsync = async (callback)=>{
    if(!connected){
        mongoose.connect(serverUri, {useNewUrlParser: true});

        var db = mongoose.connection;
        
        db.on('error', console.error.bind(console, 'connection error:'));
        db.once('open', function(){
            connected = true;
        });
    }
    await callback(db);
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