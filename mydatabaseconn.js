var mongo = require('mongodb');

module.exports.init = function (callback) {
var urlmLab = process.env.MONGOLAB_URI;

var mongoClient = mongo.MongoClient;

var db;

mongoClient.connect(urlmLab || 'mongodb://localhost:27017/code101', function(err, database) {
 if (err) {
     throw new Error('Database failed to connect.'); 
   } else {
     console.log('Successfully connected to MongoDB.'); 
     db = database;
     
     database.createCollection("nightlife_app_db", {
     capped: true, 
     size: 5242880, 
     max: 5000 
   }); 
   }
   
    module.exports.client = database;
    callback(err);   
}); // end db connected
};