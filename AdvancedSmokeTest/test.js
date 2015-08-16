/*
TODO:
- Ability to suppress words from output (like passwords)
- Path for autotext is currently aware of full folder structure
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
var logger = new BasicLogger(1);
var controller = new BrowserController('./pages', logger);

// add in list of browser errors we can safely ignore
controller.ignorableErrors.push(/www\.google\.com\/pagead/);
controller.ignorableErrors.push(/www\.google\.com/);
controller.ignorableErrors.push(/\.gstatic\.com/);
controller.ignorableErrors.push(/pagead2.googlesyndication.com/);
controller.ignorableErrors.push(/googleads.g.doubleclick.net/);
controller.ignorableErrors.push(/ytimg/);

// run test
controller.goToUrl('http://lessthandot.com').then(function(pageObject){
	logger.stdout('Step 1', ' => Loaded Site: We are on page "' + pageObject.getTitle() + '" and we are ' + (pageObject.getIsLoggedOut() ? 'not ' : '') + 'logged in');

	return pageObject.pressLogin();
}).then(function(pageObject){
	logger.stdout('Step 2', ' => Navigate to Login Page: We are on page "' + pageObject.getTitle() + '"');

	pageObject.typeUsername(config.username);
	pageObject.typePassword(config.password);
	return pageObject.clickLoginButton();
}).then(function(pageObject){
	logger.stdout('Step 3', ' => Login: We are on page "' + pageObject.getTitle() + '" and we ' + (pageObject.getIsLoggedOut() ? 'failed the login' : 'logged in successfully'));

	return pageObject.waitForRedirectTo('http://lessthandot.com');
}).then(function(pageObject){
	logger.stdout('Step 4', ' => Redirected Back: We are on page "' + pageObject.getTitle() + '" and we are ' + (pageObject.getIsLoggedOut() ? 'not ' : '') + 'logged in');

	controller.phantomPage.render('success.png');
}).catch(function(err){
	if(err.message){
		logger.error('Test', 'unhandled error: ' + err.name + ':' + err.message + '\nStack Trace:\n' + err.stack);
	}
	else{
		logger.error('Test', 'unhandled error: ' + err);
	}
	controller.phantomPage.render('lasterror.png');
}).finally(function(){
	phantom.exit();
});

