// config/passport.js

// load all the things we need
var LocalStrategy    = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var config           = require('../config');
// load up the user model
var mongoose = require('mongoose');
var User       = require('../model/user');




module.exports = function(passport, config, logger) {   
    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user._id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        mongoose.connect(config.db.connectionString);
        var db= mongoose.connection;
        db.on('error', function(err){
            logger.error('mongo '+err);
        });
        db.once('open', function(){
           User.findById(id, function(err, doc){
               mongoose.connection.close();
               done(doc);
           });
        });
    });
    
    // code for login (use('local-login', new LocalStategy))
    // code for signup (use('local-signup', new LocalStategy))

    // =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================
    passport.use(new FacebookStrategy({

        // pull in our app id and secret from our auth.js file
        clientID        : config.facebookAuth.clientID,
        clientSecret    : config.facebookAuth.clientSecret,
        callbackURL     : config.facebookAuth.callbackURL

    },

    // facebook will send back the token and profile
    function(token, refreshToken, profile, done) {
        mongoose.connect(config.db.connectionString);
        var db= mongoose.connection;
        db.on('error', function(err){
            logger.error('mongo '+err);
        });
        db.once('open', function(){
            User.find({fbUID:profile.id}, function(err, docs){
                if(err)
                    return done(err);

                if(docs.length === 1){
                    logger.info('check '+profile.displayName);
                    docs[0].token = token;
                    docs[0].save(function(err, doc){
                        logger.info('connected '+profile.displayName)
                        mongoose.connection.close();
                        done(null, docs[0]);
                    });                    
                }else{
                    logger.info('new :'+profile.displayName);
                    var user = new User({
                        fbUID: profile.id,
                        userName: profile.displayName,
                        token: token
                    });
                    user.save(function(err, doc){
                        logger.info('persist '+profile.displayName);
                        mongoose.connection.close();
                        done(null, user);
                    })
                }
            });
        });
    }));
    return passport;

};