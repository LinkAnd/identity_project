var log4js		 = require('log4js');

module.exports = function(config){
	log4js.configure({
	  appenders: [
	    { 'type': 'console' },
	    { 'type': 'file', 'filename': config.logging.file, 'maxLogSize': 20480, 'backups': 10, }
	  ]
	});

	return log4js.getLogger(config.logging.category);
};