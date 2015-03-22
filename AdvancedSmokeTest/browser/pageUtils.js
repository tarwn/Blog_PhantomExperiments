var _ = require('lodash');
var Promise = require("bluebird");

module.exports = {

	initializeUtils: function(phantomPage){

		function injectAdditionalScripts(reject){
			var vers = [];
			if(!phantomPage.injectJs('./browser/scripts/jquery.autotype.js')){
				reject('autotype didn\'t load');
			}
			else{
				vers.push('autotype', phantomPage.evaluate(function(){ return $.fn.autotype.defaults.version; }));
			}
			return vers;
		}

		return new Promise(function(resolve, reject){
			if(phantomPage.evaluate(function(){ return ($ !== undefined) })){
				var version = phantomPage.evaluate(function(){ return $.fn.jquery; });
				var vers = injectAdditionalScripts(reject);
				resolve('JQuery is already present: ' + version + ', ' + vers.join(','));
			}
			else{
				phantomPage.includeJs("https://code.jquery.com/jquery-1.11.2.min.js", function() {
					phantomPage.injectJs('scripts/jquery.autotype.js');
					var vers = injectAdditionalScripts(reject);
					resolve('JQuery was not present, added 1.11.2, ' + vers.join(','));
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
			getValue: function(){
				return phantomPage.evaluate(function(s){
					return $(s).val();
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
			},
			type: function(text){
				phantomPage.evaluate(function(s, t){
					$(s).autotype(t);
				}, selector, text);
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