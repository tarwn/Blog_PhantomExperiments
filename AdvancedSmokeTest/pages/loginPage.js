var pageUtils = require("../browser/pageUtils");

module.exports = {
	name: "loginPage",
	description: "the login page",
	pattern: /.*/,
	attachBehavior: function(basicPageObject, phantomPage, loadNewPage){

		/* Basic login page behavior */
		basicPageObject.typeUsername = function(username){
			pageUtils.getElement(phantomPage, '#txtLogin').type(username);
		};

		basicPageObject.typePassword = function(password){
			pageUtils.getElement(phantomPage, '#txtPassword').type(password);
		};

		basicPageObject.clickLoginButton = function(){
			return loadNewPage(function(){
				pageUtils.getElement(phantomPage, 'input[name="btnSubmit"]').click();
			});
		};

		/* Login page with error message visible */


		/* Login success redirect - we really should have made these seperate pages */
		basicPageObject.getIs = function(){
			return loadNewPage(function(){
				pageUtils.getElement(phantomPage, 'input[name="btnSubmit"]').click();
			});
		};
	}
};