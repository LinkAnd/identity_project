
var express = require('express');
var config  = require('./config');
var app = express();
var passport = require('passport');
var passportLocal = require('./passport');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');
var _            = require('lodash');

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

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, accessToken");
  next();
});

app.get('/auth/facebook', authorization.authenticate('facebook', { scope : ['email', 'public_profile', 'user_posts'] }));

// handle the callback after facebook has authenticated the user
app.get('/auth/facebook/callback',
	authorization.authenticate('facebook', {
	    successRedirect : '/logged',
	    failureRedirect : '/'
}));

function isLogged(req, res, next){
	var db = mongoose.createConnection(config.db.connectionString); // to be carefull with this
    
    db.on('error', function(err){
            logger.error('mongo '+err);
            mongoose.connection.close();
            return;
    });
    if(req.user){
    	logger.info("user logged "+req.user.userName);
    	next();
    }
    var accessToken = req.cookies.accessToken || req.headers.accesstoken;
    if(!accessToken){
    	logger.error('request invalid : '+req);
    	res.send(401);
    	return;
    }
 	logger.info('third party use token :'+accessToken); 	
 	db.once('open', function(){
 		var U = db.model('User');
 		U.find({token:accessToken}, function(err, docs){
 			if(docs.length > 1){
 				res.send(409)
 				logger.error('conflict for the token');
 				db.close();
 				return false;
 			}
 			logger.info('found '+ docs);
 			req.user = docs[0];
 			db.close();
 			next();
 		});
 	});
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
    res.redirect(config.frontendURl+req.user.token);
});

/*
* IMPORTANT PRIVATE route
*/
app.get('/authorize', isLogged, function(req, res){
	if(!req.user){
		res.send(401);
	}
	res.json(req.user);
});

/**
* IMPORTANT PUBLIC ROUTE
*/
app.get('/whois/:uid', function(req, res){
	if(!req.params['uid']){
		res.send(404);
	}
	mongoose.connect(config.db.connectionString);
    var db= mongoose.connection;
    db.on('error', function(err){
        logger.error('mongo '+err);
        mongoose.connection.close();
        done(err);
    });
    db.once('open', function(){
    	User.findById(req.params['uid'], function(err, doc){
    		if(err || !doc){
    			logger.error("whois route not found user for : "+req.params['uid']);
    			mongoose.connection.close();
    			res.send(404);
    			return;
    		}
    		mongoose.connection.close();
    		var usr = doc.toJSON();
    		var usrClean = _.omit(usr, config.privacyColumns);
    		logger.info(usrClean);
    		res.json(usrClean);
    	});
    });
});




app.listen(config.server.port, function () {
  logger.info('server '+config.server.port);
});