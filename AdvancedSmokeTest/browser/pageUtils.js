var _ = require('lodash');
var Promise = require("bluebird");

module.exports = {

	initializeUtils: function(phantomPage){
		return new Promise(function(resolve){
			if(phantomPage.evaluate(function(){ return ($ !== undefined) })){
				var version = phantomPage.evaluate(function(){ return $.fn.jquery; });
				resolve('JQuery is already present: ' + version);
			}
			else{
				phantomPage.includeJs("https://code.jquery.com/jquery-1.11.2.min.js", function() {
					resolve('JQuery was not present, added 1.11.2');
				});
			}
		});
	},
	getElement: function(phantomPage, selector){
		return {
			getInnerText: function(){ 
				return phantomPage.evaluate(function(s){
					return $(s).text();
				}, selector); 
			},
			getIsVisible: function(){
				return phantomPage.evaluate(function(s){
					return $(s).is(":visible");
				}, selector); 
			},


			click: function(){
				phantomPage.evaluate(function(s){
					var event = document.createEvent('MouseEvents');
					event.initMouseEvent(
						"click",
						true /* bubble */, true /* cancelable */,
						window, null,
						0, 0, 0, 0, /* coordinates */
						false, false, false, false, /* modifier keys */
						0 /*left*/, null
					);

					$(s).get(0).dispatchEvent(event);
				}, selector);
			}
		};
	},
	
	getUrl: function(phantomPage){
		return phantomPage.evaluate(function(){
			return document.URL;
		});
	},
	getTitle: function(phantomPage){
		return phantomPage.evaluate(function(){
			return document.title;
		});
	}

};