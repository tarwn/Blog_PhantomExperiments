var pageUtils = require("../browser/pageUtils");

module.exports = {
	name: "anyPage",
	description: "common behavior for all lessthandot pages",
	pattern: /.*/,
	attachBehavior: function(basicPageObject, phantomPage, loadNewPage){

		basicPageObject.getIsLoggedIn = function(){
			return pageUtils.getElement(phantomPage, '#snav a:contains("logout")').getIsVisible();
		};

		basicPageObject.getIsLoggedOut = function(){
			return pageUtils.getElement(phantomPage, '#snav a:contains("Login")').getIsVisible();
		};

		basicPageObject.getLogInWelcomeText = function(){
			return pageUtils.getElement(phantomPage, '#snav').getInnerText();
		};

		basicPageObject.pressLogin = function(){
			return loadNewPage(function(){
				pageUtils.getElement(phantomPage, '#snav a:contains("Login")').click();
			});
		};

		basicPageObject.waitForRedirectTo = function(url){
			return loadNewPage(function(){
				// just wait patiently...
			});
			// and then we could then an assertion with a URL if we had assertions...
		};
	}
};