/// index.js routes - uses Yelp API

    
//var db = app.settings.db;
var mongo = require('../mydatabaseconn.js');


var Yelp = require('yelp');
var twitterAPI = require('node-twitter-api');



var twk = process.env.TWITKEY;
var ts = process.env.TWITSECRET;

    var twitter = new twitterAPI({
    consumerKey: twk ,
    consumerSecret: ts ,
    callback: 'https://desolate-hollows-83053.herokuapp.com/search'
});
///

/*
 * GET home page.
 */

exports.index = function(req, res){
    
    console.log("DB: ");
    //console.log(mongo.client );
    
    res.render('pages/index', {
                title: 'NightLife App'
            });
};

// logout user
exports.logout = function(req, res){
        req.session.user = null;
        req.session.sn = null;
        req.session.tokenSecret = null;
        req.session.token = null;
        req.session.location = null;
        res.redirect('/');
};


// user going
exports.userGoing = function(req, res){
    var sn = req.session.sn || 0;
    var venueID = req.body.venue_id || 0;
    var location = req.session.location || 0;
    var venueName = req.body.venue_name || 0;
    console.log("venue: " + venueID);
    console.log("location: " + location);
    console.log("SN: " + sn); 
    console.log("venueName : " + venueName); 
    if( sn === 0 ){
    twitter.getRequestToken(function(error, requestToken, requestTokenSecret, results){
    if (error) {
        console.log("Error getting OAuth request token : " + error);
    } else {
        //store token and tokenSecret somewhere, you'll need them later; redirect user 
        req.session.token = requestToken;
        req.session.tokenSecret = requestTokenSecret;
         res.redirect(twitter.getAuthUrl(requestToken)); 
    }
});
     
    } // end check sn
    else{
        // process going
        var qGoingObj = {};    
        qGoingObj = { 
                 "sn": sn,
                 "venueID": venueID,
                 "venueName": venueName,
                 "location": location,
                 "going": 1
               }; 
               
    userGoing(qGoingObj, sn, mongo.client, res, function(result) {
        console.log("RES userGoing: ");
        console.log(result);
        
     if( result ){
            ////////
            
            aggGoing(qGoingObj.venueID, mongo.client, res, function(result0) {
                   
                        console.log(result0);
            ////////
            getYelp (location, req, res, function(result) {
            //res.send(result);
            console.log("Loggged In Already!");
            
            
             var newObj = {};  
             var obj1 = result.businesses;
             var obj2 = result0;
             
             for (var i = 0; i < obj1.length; i++) { 
                     obj1[i].going = 0;
                     console.log("going added!!");
                    }
            
            for(var j=0; j< obj2.length; j++){
                       console.log ("here1");
                       console.log(obj2[j].count);
                       console.log(obj2[j]._id);
            }
            
             for (var i = 0; i < obj1.length; i++) { 
                     for(var j=0; j< obj2.length; j++){
                         
                      if (obj1[i].name === obj2[j]._id) {
                        console.log('match - set count!');
                        obj1[i].going = obj2[j].count;
                      } else {
                        console.log('No match found!');
                      }
                     }
                     
                    }            
                    
            //[{"_id":"Phil Carrolls","count":1} = obj2
            //,"name":"Phil Carrolls"," = obj1 venue name 
            
           // res.send(obj1);
            
            res.render('pages/nightLife', {
            title: 'NightLife App',
            search: venueID,
            sum: result0,
            //data: result.businesses,
            data: obj1,
            error: "",
            sn: sn
            });
            
            });   
                
                ////////                
    });
    

    }
    else{
        res.redirect('/');
    }
}); // end user going call 
}
};

//test user going
exports.going = function(req, res){
    ////        
    var goingName = req.query.name;
    
     console.log("pub name" + goingName);
     
    console.log ("user:");
    var user = req.session.user || 0;
    console.log(user);
    var sn = req.session.sn || 0;
    
    var venueID = req.query.id || 0;
    var location = req.session.location;
    console.log("venue: " + venueID);
    console.log("location: " + location);
    
twitter.getRequestToken(function(error, requestToken, requestTokenSecret, results){
    if (error) {
        console.log("Error getting OAuth request token : " + error);
    } else {
        //store token and tokenSecret somewhere, you'll need them later; redirect user 
        req.session.token = requestToken;
        req.session.tokenSecret = requestTokenSecret;
         res.redirect(twitter.getAuthUrl(requestToken)); 
    }
});

    
/////


};

exports.processSearch = function(req, res){
    var location = req.session.location;
    
    var sn = req.session.sn || 0;
    console.log("SN" + sn);
    
    console.log("location: " + location);
    
    var venueID = req.query.venueID || req.body.venue;
    console.log("ven id: " + venueID);
 
    var oauth_token = req.oauth_token || 0;
   // var oauth_verifier = req.oauth_verifier;
   // var requestToken = req.session.token;
    var requestTokenSecret = req.session.tokenSecret || 0;
    var sname = req.query.screen_name || 0;
    var requestToken = req.query.oauth_token || 0;
    var oauth_verifier = req.query.oauth_verifier || 0;
    console.log (oauth_token + " " + requestTokenSecret + " " + requestToken + "  " + oauth_verifier );
    
    if(requestTokenSecret === 0){
            res.render('pages/search', {
                title: 'NightLife App',
                sn: sn,
                venueID: venueID
            });
    }
    else if ( sn === 0 ){
    console.log("DB1: ");
    //console.log(mongo.client);
    
// check with twitter//
twitter.getAccessToken(requestToken, requestTokenSecret, oauth_verifier, function(error, accessToken, accessTokenSecret, results) {
if (error) {
console.log(error);
res.render('pages/search', {
title: 'NightLife App',
venueID: venueID,
sn: sn
});
} else {
//store accessToken and accessTokenSecret somewhere (associated to the user) 
//Step 4: Verify Credentials belongs here 
req.session.accessToken = accessToken;
req.session.accessTokenSecret = accessTokenSecret;

twitter.verifyCredentials(accessToken, accessTokenSecret, function(error, data, response) {
if (error) {
//something was wrong with either accessToken or accessTokenSecret 
//start over with Step 1 
res.render('pages/search', {
title: 'NightLife App',
venueID: venueID,
sn: sn
});
} else {
//accessToken and accessTokenSecret can now be used to make api-calls (not yet implemented) 
//data contains the user-data described in the official Twitter-API-docs 
//you could e.g. display his screen_name 
console.log( "NAME" + data["screen_name"]);
console.log("IMAGE URL");
console.log(data["profile_image_url"]);
var image = data["profile_image_url"];
req.session.sn = data["screen_name"];
sn = req.session.sn;

findUser(image, sn, mongo.client, res, function(result) {
    if(result !=0 ){
        ////////
            
pullGoingYelpRes (res, req, location, sn); // repeative group call
            
            
            //////////////
pullGoingYelpRes (res, req, location, sn); // repeative group call
        
        ////////
    }
});


//    getYelp(venueID, req, res );
console.log("HERE logged in" + location);
pullGoingYelpRes (res, req, location, sn); // repeative group call
}
});

}
});
}
   else{
       console.log ("here - humm");
       
pullGoingYelpRes (res, req, location, sn); // repeative group call
   }
};

exports.yelpSearch = function(req, res){

  var sn = req.session.sn || 0;
  
  var location = req.body.search;
   console.log("Option " + location);
   
if(location === ""){
       res.render('pages/search', {
                title: 'NightLife App',
                sn: sn  
            });
   }
   else {
       pullGoingYelpRes (res, req, location, sn); // repeative group call
}  
//////////////
//getYelp(location, req, res ); 
        
};

function getYelp(location, req, res, callback ){

var yck = process.env.YELPKEY;
var ys = process.env.YELPSECRET;
var yt = process.env.YELPTOKEN;
var ytk = process.env.YELPTOKKEY;

    var yelp = new Yelp({
    consumer_key : yck,
    consumer_secret : ys,
    token : yt,
    token_secret : ytk 
  });  
   
req.session.location = location;
yelp.search({ term: 'nightlife bar', location: location })
.then(function (data) {
//  console.log(data);
  
   callback(data);
})
.catch(function (err) {
  console.error(err);
  
   callback(err);
   /*
  res.render('pages/nightLife', {
        title: 'NightLife App'
        error: err
    });  
    */
});
}

//////////////////////////////////
function findUser(image, sn,mongo,res, callback) {
  getUserData(image, sn,mongo, res, function(data) {
    callback(data);
  });
}
   
function getUserData(image, sn, mongo, res, callback) {
                console.log("db3: ");
                //console.log(mongo);
                var query = {   'sn' : sn,
                                'image' : image };
                     console.log(query);
                     console.log('query');
mongo.collection('users', function(err, collection) {
           if (err) throw err; 
    collection.findOne({ 'sn': sn }, function(err, user) { 
    
    if (err) throw err; 
    if (user) { 
        console.log("user exists");
        callback(user);
    }
    else if(sn !=0){
        console.log("user does not exists");
        // save user to db
        var squery = mongo.collection('users'); 
        console.log(squery);
        squery.insert(query, function(err, result1) { 
         if (err) throw err; 
            console.log('Saved ' + result1); 
            //return result;
        callback(1);
            });
    }
    else{
        callback(0);
    }
    }); 
    });                      
}
//////

//////////////////////////////////
function userGoing(qGoingObj, sn, mongo, res, callback) {
  getGoingData(qGoingObj, sn, mongo, res, function(data) {
    callback(data);
  });
}
   
function getGoingData(qGoingObj, sn, mongo, res, callback) {
    console.log("db3: ");
    //console.log(mongo);
    var query = qGoingObj;
    console.log(query);
    console.log('query');
mongo.collection('going', function(err, collection) {
           if (err) throw err; 
    collection.findOne({ 'sn': qGoingObj.sn, 'venueID' : qGoingObj.venueID }, function(err, userGoing) {
    if (err) throw err; 
    if (userGoing) { 
        console.log("user going exists");
        console.log(userGoing);
        // delete user going record....
        ///////////////////////
        
        mongo.collection('going', function(err, collection) {
         if (err) throw err;
	// find the going user with the list.
      collection.remove({'sn': qGoingObj.sn, 'venueID': qGoingObj.venueID}, {w:1}, function (err, result) {
        if (err) throw err;
        console.log("Result from removing user going: ");
        //console.log(result);
       //res.redirect('/');
       callback( result );
      });
    });	  
        
        
        //////////////////////
        callback(userGoing);
    }
    else if(sn && qGoingObj.venueID){
        console.log("user Going does not exists");
        // save user to db
        var squery = mongo.collection('going'); 
        console.log(squery);
        squery.insert(query, function(err, result1) { 
         if (err) throw err; 
            console.log('Saved ');
            console.log( result1); 
            //return result;
        callback(result1);
            });
    }
    else{
        callback(0);
    }
    }); 
    });                      
}
//////

//////
function aggGoing(venueID, mongo, res, callback) {
  getARData(venueID, mongo, res, function(data) {
    callback(data);
  });
}
   /// 
function getARData(venueID, mongo, res, callback) { 
      // save into db collection
   mongo.collection('going').aggregate(
     [
     //  { $match: { "venueID": venueID } },
    {"$group" : {_id:"$venueName", count:{$sum:1}}}, {$sort:{'count':-1}}
     
      // { $group: { "_id": "$going" , "count": { $sum: 1 } } }
     ]).toArray(function(err, result) {
       if ( err ) throw err;
       console.log(result);
       callback(result);
     });
   } 
  // end sum totalling

//////////////////////////////////

function getGoings(res,db, callback) {
  getGoingsData(res,db, function(data) {
    callback(data);
  });
}

function getGoingsData(res,db, callback) { 
        var cursor = db.collection('going').find().sort({ when: -1 });
        cursor.skip(0);
        
        var tagline = "Going List: ";
         var result = [];
         var resultWhen = [];

          cursor.each(function(err, item) {
             if(item == null) {
                //db.close();
                  callback(result);
                return;
            }
        console.log(err);
          console.log(item);

             result.push({sn: item["sn"], venueID: item["venueID"],venueName: item["venueName"] , location: item["location"], going: item["going"] });
             console.log(JSON.stringify(result));
    });
   }    

//////
/// repeative group call
function pullGoingYelpRes(res, req, location, sn){
getGoings(res,mongo.client, function(result0) {
                   
                        console.log(result0);
            ////////
            getYelp (location, req, res, function(result) {
            //res.send(result);
            console.log("Loggged In Already!");
            
            
             var newObj = {};  
             var obj1 = result.businesses;
             var obj2 = result0;
             
             for (var i = 0; i < obj1.length; i++) { 
                 console.log('venueID' + obj1[i].id);
                     obj1[i].going = 0;
                     console.log("going: " + obj1[i].going );
                    }
            
            for(var j=0; j< obj2.length; j++){
                       console.log ("here2");
                       console.log(obj2[j].venueID);
                       console.log(obj2[j].going);
            }
            
             for (var i = 0; i < obj1.length; i++) { 
                     for(var j=0; j< obj2.length; j++){
                        
                      if (obj1[i].id === obj2[j].venueID) {
                        console.log('match - set count!');
                        obj1[i].going = obj2[j].going;
                        console.log("going out: " + obj1[i].going );
                      } else {
                        console.log('No match found!');
                      }
                     }
                     
                    }            
                    
            //[{"_id":"Phil Carrolls","count":1} = obj2
            //,"name":"Phil Carrolls"," - obj1 venue name 
            
           // res.send(obj1);
            
            res.render('pages/nightLife', {
            title: 'NightLife App',
            search: "test",
            sum: result0,
            //data: result.businesses,
            data: obj1,
            error: "",
            sn: sn
            });
            
            });   
                
                ////////                
    });

}
//////
