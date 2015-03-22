var pageUtils = require("../browser/pageUtils");

module.exports = {
	name: "anyPage",
	description: "common behavior for all lessthandot pages",
	pattern: /.*/,
	attachBehavior: function(basicPageObject, phantomPage, loadNewPage){

		basicPageObject.getIsLoggedIn = function(){
			return pageUtils.getElement(phantomPage, '#snav a:contains("Logout")').getIsVisible();
		};

		basicPageObject.getIsLoggedOut = function(){
			return pageUtils.getElement(phantomPage, '#snav a:contains("Login")').getIsVisible();
		};

		basicPageObject.pressLogin = function(){
			return loadNewPage(function(){
				pageUtils.getElement(phantomPage, '#snav a:contains("Login")').click();
			});
		};

	}
};