
var express = require('express');
var config  = require('./config');
var app = express();
var passport = require('passport');
var passportLocal = require('./passport');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');


/**
*  middleware section
*/
app.use(cookieParser());
app.use(bodyParser());
app.use(session({ secret: config.session.secret }));

/**
* model section
*/
var User       = require('./model/user');

/**
* services section
*/
var logger = require('./services/logger')(config);

/**
* DB section
*/
var mongoose = require('mongoose');

/**
* Passport section
*/
var authorization = new passportLocal(passport, config, logger);
app.use(authorization.initialize());
app.use(authorization.session());
app.get('/auth/facebook', authorization.authenticate('facebook', { scope : ['email', 'public_profile', 'user_posts'] }));

// handle the callback after facebook has authenticated the user
app.get('/auth/facebook/callback',
	authorization.authenticate('facebook', {
	    successRedirect : '/logged',
	    failureRedirect : '/'
}));

function isLogged(req, res, next){
	
	mongoose.createConnection(config.db.connectionString);
    var db= mongoose.connection;
    db.on('error', function(err){
            logger.error('mongo '+err);
            mongoose.connection.close();
            return;
    });
    next();
    /*db.on('error', function(err){
        logger.error('mongo '+err);
    });	
	db.once('open', function(){
		logger.debug("ici");
		User.find({token:req.cookies.accessToken}, function(err, docs){
			if(err)
				logger.error(err);
			logger.info('user logged' + docs)
			mongoose.connection.close();
			next();
		});
	});*/
}

/**
* general route
*/
app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.get('/logout', function(req, res){
	if(req.user){
		logger.info('disconnect '+req.user.userName);
		req.session.destroy();
		req.logout();
	}	
    res.redirect('/');
});

app.get('/logged', isLogged, function(req, res){
	logger.info('logged '+req.user.userName);
	var cookie = req.cookies.accessToken;
    res.cookie('accessToken',req.user.token, { maxAge: 900000, httpOnly: true });
    res.redirect('http://localhost:3001/');
});

/*
* IMPORTANT PRIVATE route
*/

app.get('/authorize', isLogged, function(req, res){
	logger.info('disconnect '+req.user.userName);
	res.json(req.user);
});




app.listen(config.server.port, function () {
  logger.info('server '+config.server.port);
});