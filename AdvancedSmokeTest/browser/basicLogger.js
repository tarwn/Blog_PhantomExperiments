function BasicLogger(){
	this.debug = function(arg){
		if(_.isObject(arg)){
			console.log('[DEBUG] Object: ');
			console.log(arg);
		}
		else{
			console.log('[DEBUG] ' + arg);
		}
	};

	this.stdout = function(arg){
			console.log(arg);
	};

	this.error = function(arg){
			console.log('[ERROR]' + arg);
	};
}

module.exports = BasicLogger;