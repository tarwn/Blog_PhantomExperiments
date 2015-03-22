/*
TODO:
- Ability to suppress words from output (like passwords)
- Path for autotext is currently aware of full folder structure

Next up:
- password entry, button click
- wait for page redirect
- verify URL

- How do we do assertions?
*/

var system = require('system');
var Promise = require('bluebird');
var _ = require("lodash");
var BasicLogger = require('./browser/basicLogger');
var BrowserController = require('./browser/browserController');

// capture args
var config = require('./inputArgs').parse(system.args);
if(config === undefined || !config.isValid){
	console.log('Must pass these 3 args when running script:');
	console.log(' -u [username]');
	console.log(' -p [password]');
	console.log(' -n [displayed user\'s name]');
	phantom.exit();
}

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
	pageObject.typeUsername(config.username);
/*	pageObject.enterPassword(config.password);
	return pageObject.clickLoginButton();

}).then(function(pageObject){
	
	console.log('[TEST] Step 3 => We are on page "' + pageObject.getTitle() + '" and we ' + (getIsLoggedOut ? 'failed the login' : 'logged in successfully'));
	return pageObject.waitForRedirectTo('http://lessthandot.com');

}).then(function(pageObject){
	
	console.log('[TEST] Step 4 => We are on page "' + pageObject.getTitle() + '" and we are ' + (getIsLoggedOut ? 'not ' : '') + 'logged in');
*/	controller.phantomPage.render('success.png');
}).catch(function(err){
	if(err.message){
		logger.stdout('[ERROR] unhandled error: ' + err.name + ':' + err.message + '\nStack Trace:\n' + err.stack);
	}
	else{
		logger.stdout('[ERROR] unhandled error: ' + err);
	}
	controller.phantomPage.render('lasterror.png');
}).finally(function(){
	phantom.exit();
});

