var system = require('system');
var Promise = require('bluebird');
var _ = require("lodash");
var BasicLogger = require('./browser/basicLogger');
var BrowserController = require('./browser/browserController');

// capture args
var x = system.args;
/*
var config = parseArgs(system.args);
if(config === undefined || config.isMissingRequiredArg()){
	console.log('Must pass these 3 args when running script:');
	console.log(' -u [username]');
	console.log(' -p [password]');
	console.log(' -n [displayed user\'s name]');
	return;
}
*/
// setup controller
var logger = new BasicLogger();
var controller = new BrowserController('./pages', logger);
controller.ignorableErrors.push(/www\.google\.com\/pagead/);
controller.ignorableErrors.push(/pagead2.googlesyndication.com/);
controller.ignorableErrors.push(/googleads.g.doubleclick.net/);

// run test
controller.goToUrl('http://lessthandot.com').then(function(pageObject){

	console.log('[TEST] Step 1 => We are on page "' + pageObject.getTitle() + '" and we are ' + (pageObject.getIsLoggedOut() ? 'not ' : '') + 'logged in');
	return pageObject.pressLogin();

}).then(function(pageObject){
	
	console.log('[TEST] Step 2 => We are on page "' + pageObject.getTitle() + '"');
/*	pageObject.enterUsername(config.username);
	pageObject.enterPassword(config.username);
	return pageObject.clickLoginButton();

}).then(function(pageObject){
	
	console.log('[TEST] Step 3 => We are on page "' + pageObject.getTitle() + '" and we ' + (getIsLoggedOut ? 'failed the login' : 'logged in successfully'));
	return pageObject.waitForRedirectTo('http://lessthandot.com');

}).then(function(pageObject){
	
	console.log('[TEST] Step 4 => We are on page "' + pageObject.getTitle() + '" and we are ' + (getIsLoggedOut ? 'not ' : '') + 'logged in');
	controller.phantomPage.render('success.png');
*/
}).catch(function(err){
	logger.stdout('[ERROR] unhandled error: ' + err.message + '\nStack Trace:\n' + err.stack);
	controller.phantomPage.render('lasterror.png');
}).finally(function(){
	phantom.exit();
});


function parseArgs(args){
	if(args.h)
		return;

	var latestArg = null;
	var parsedConfig = _.reduce(args, function(configs, arg){
		if(arg[0] === '-' && arg.length > 1){
			switch(arg.slice(1)){
				case 'u': 
					configs.username = null;
					latestArg = 'username';
					break;
				case 'p': 
					configs.password = null;
					latestArg = 'password';
					break;
				case 'n': 
					configs.name = null;
					latestArg = 'name';
					break;
			}
		}
		else if(latestArg !== null){
			configs[latestArg] = arg;
			latestArg = null;
		}
	}, {});

	parsedConfig.isMissingRequiredArg = function(){
		return parsedConfig.username == null || parsedConfig.password == null || parsedConfig.name == null;
	};

	return parsedConfig;
}
