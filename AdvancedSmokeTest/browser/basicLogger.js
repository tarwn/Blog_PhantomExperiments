function BasicLogger(){
	this.debug = function(arg){
		if(_.isObject(arg)){
			
		}
		else{
			console.log('[DEBUG] ' + arg);
		}
	};

	this.stdout = function(arg){
			console.log(arg);
	};
}

module.exports = BasicLogger;