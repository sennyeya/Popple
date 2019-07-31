var mongoose = require('mongoose');
var config = require('./config');

var serverUri = config.dbString;

module.exports.connect = (callback)=>{
    mongoose.connect(serverUri, {useNewUrlParser: true});

    var db = mongoose.connection;
    
    db.on('error', console.error.bind(console, 'connection error:'));
    console.log(callback)
    db.once('open', function(){
        console.log("Connected");
    });
    callback(db);
}