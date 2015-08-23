/*
TODO:
- Ability to suppress words from output (like passwords)
- Path for autotext is currently aware of full folder structure
- track download size/client page
*/

var system = require('system');
var Promise = require('bluebird');
var _ = require("lodash");
var chai = require("chai");
var assert = chai.assert;

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
var controller = new BrowserController('./pages', './browser', logger);

// add in list of browser errors we can safely ignore
controller.ignorableErrors.push(/www\.google\.com\/pagead/);
controller.ignorableErrors.push(/www\.google\.com/);
controller.ignorableErrors.push(/\.gstatic\.com/);
controller.ignorableErrors.push(/pagead2.googlesyndication.com/);
controller.ignorableErrors.push(/googleads.g.doubleclick.net/);
controller.ignorableErrors.push(/ytimg/);

// run test
Promise.resolve().then(function(){

	logger.stdout('Step 1', 'Load the site, we won\'t be logged in');
	return controller.goToUrl('http://lessthandot.com');

}).then(function(pageObject){
	assert.equal(pageObject.getUrl(), 'http://lessthandot.com/');
	assert.equal(pageObject.getTitle(), 'Less Than Dot - Launchpad - Less Than Dot');
	assert.ok(pageObject.getIsLoggedOut(), 'Logged out on initial visit');

	logger.stdout('Step 2', 'Navigate to Login Page from menu');
	return pageObject.pressLogin();

}).then(function(pageObject){
	assert.equal(pageObject.getUrl(), 'http://lessthandot.com/login.php?backtrack=http://lessthandot.com/index.php?');
	assert.equal(pageObject.getTitle(), 'Less Than Dot - Launchpad - Less Than Dot - Login');

	logger.stdout('Step 3', 'Perform login');
	pageObject.typeUsername(config.username);
	pageObject.typePassword(config.password);
	return pageObject.clickLoginButton();
}).then(function(pageObject){
	assert.equal(pageObject.getUrl(), 'http://lessthandot.com/login.php?backtrack=http://lessthandot.com/index.php?');
	assert.ok(pageObject.getIsLoggedIn(), 'Logged in now');

	logger.stdout('Step 4', 'Wait for automatic redirect');
	return pageObject.waitForRedirectTo('http://lessthandot.com');
}).then(function(pageObject){
	assert.equal(pageObject.getUrl(), 'http://lessthandot.com/index.php?');
	assert.equal(pageObject.getTitle(), 'Less Than Dot - Launchpad - Less Than Dot');

	logger.stdout('Success', 'We have logged in successfully.');
	controller.phantomPage.render('success.png');

	console.log("Resources downloaded: " + _.keys(pageObject.resources).length);
	var resources = _.reduce(pageObject.resources, function(result, n, key){
		return result + '{ key:"' + key + '", time: "' + (n.endTime - n.startTime) + 'ms" }\n';
	});
	console.log(resources);

//}).catch(AssertionError, function(err){
//	logger.error('FAIL', 'Assertion Failed: ' + err.message);
//	controller.phantomPage.render('lasterror.png');
}).catch(function(err){
console.log(err.prototype);
	if(err.name == 'AssertionError'){
		logger.error('ASSERT FAIL', err.message);
	}
	else if(err.message){
		logger.error('Test', 'unhandled error: ' + err.name + ':' + err.message + '\nStack Trace:\n' + err.stack);
	}
	else{
		logger.error('Test', 'unhandled error: ' + err);
	}
	controller.phantomPage.render('lasterror.png');
}).finally(function(){
	phantom.exit();
});

