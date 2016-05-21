module.exports = {
	server : {
		port: 3000
	},
	db : {
		connectionString : 'mongodb://localhost/Authorization'
	},
	facebookAuth : {
		'clientID'      : '1446733678890261', // your App ID
        'clientSecret'  : '5f095c77333b19fb5857c5e866ab639f', // your App Secret
        'callbackURL'   : 'http://localhost:3000/auth/facebook/callback'
	}
}