var User = function(mongoose){
	var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

    return mongoose.model('User', new Schema({
    	userName: String,
    	fbUID: String,
    	tweetUID: String,
    	img: String,
    	points: {type:Number, default:0}
    }));
};


module.exports = User;