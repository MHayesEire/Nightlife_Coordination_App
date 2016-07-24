//Build a NightLife  Co-ordination App
//FCC API Basejump: Build a NightLife Co-ordination App
'use strict';

var mongo = require('./mydatabaseconn.js');

var ejs = require('ejs');

var express = require('express');

var routes = require('./routes');

var app = express();

var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

app.set('view engine', 'ejs');

////////////

app.use(morgan('dev')); // logger
app.use(cookieParser()); // for authencating
//app.use(bodyParser()); 


app.use(bodyParser.urlencoded({ extended: true })); 
app.use(bodyParser.json()); 
app.use('/', express.static(process.cwd() + '/')); 
      
var port = process.env.PORT || 8080; 
var secret = process.env.SECRET || 'nodejsnightlifemartin';

app.use(session({ secret: secret }));

app.get('/', routes.index);

app.get('/going/:venue*', routes.going);

app.get('/search', routes.processSearch);

app.post('/yelpSearch', routes.yelpSearch);

app.get('/logout', routes.logout);

app.post('/userGoing', routes.userGoing);


mongo.init(function (error) {
    if (error)
        throw error;

    app.listen(port,  function () 
{
	
console.log('Node.js ... HERE ... listening on port ' + port + '...');

});
});