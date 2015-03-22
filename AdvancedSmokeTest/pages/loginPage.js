var pageUtils = require("../browser/pageUtils");

module.exports = {
	name: "loginPage",
	description: "the login page",
	pattern: /.*/,
	attachBehavior: function(basicPageObject, phantomPage, loadNewPage){

		basicPageObject.typeUsername = function(username){
			pageUtils.getElement(phantomPage, '#txtLogin').type(username);
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