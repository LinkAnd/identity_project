var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
	userName: String,
    fbUID: String,
    tweetUID: String,
    img: String,
    points: {type:Number, default:0},
    token: String
});

module.exports = mongoose.model('User', userSchema);