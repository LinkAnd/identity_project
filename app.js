
var express = require('express');
var config  = require('./config');
var app = express();
var passport = require('passport');
var passportLocal = require('./passport');


/**
*
*/
var mongoose = require('mongoose');
 
mongoose.connect(config.db.connectionString);


var authorization = new passportLocal(passport, mongoose);
console.log(authorization.passport);
/**
* Passport section
*/
app.get('/auth/facebook', authorization.authenticate('facebook', { scope : ['email', 'public_profile', 'user_posts'] }));

    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback',
        authorization.authenticate('facebook', {
            successRedirect : '/info',
            failureRedirect : '/'
        }));






app.get('/', function (req, res) {
  res.send('Hello World!');
});

/*
* IMPORTANT PRIVATE route
*/
app.get('/info', function(req, res){
	res.send(config);
});

app.listen(config.server.port, function () {
  console.log('identity running on '+config.server.port);
});