module.exports = {
	parse: function parseArgs(args){

		if(args.h)
			return;

		var lookup = {
			'u': 'username',
			'p': 'password',
			'n': 'name'
		};

		var parsedConfig = { };
		var latestArg = null;
		args.forEach(function(arg){
			if(arg[0] === '-' && arg.length > 1){
				latestArg = lookup[arg.slice(1)];
				parsedConfig[latestArg] = null;
			}
			else if(latestArg !== null){
				parsedConfig[latestArg] = arg;
				latestArg = null;
			}
		});

		parsedConfig.isValid = (parsedConfig.username != null && parsedConfig.password != null && parsedConfig.name != null);

		return parsedConfig;
	}
}