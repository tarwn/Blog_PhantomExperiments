/*
Log Levels:
	0: nothing
	1: basic navigation
	2: non-ignore messages
	3: everything
*/

function BasicLogger(debugLevelFilter){
	var self = this;
	self.debugLevelFilter = debugLevelFilter || 0;

	var pad = function(category){
		var full = category + '                ';
		return '[' + full.substring(0, 15) + '] '
	};

	this.debug = function(debugLevel, category, arg){
		if(debugLevel > self.debugLevelFilter)
			return;

		if(_.isObject(arg)){
			console.log('[---]' + pad(category));
			console.log(arg);
		}
		else{
			console.log('[---] ' + pad(category) + arg);
		}
	};

	this.stdout = function(category, arg){
			console.log('[OUT]', pad(category), arg);
	};

	this.error = function(category, arg){
			console.log('[ERR] ' + pad(category) + arg);
	};
}

module.exports = BasicLogger;