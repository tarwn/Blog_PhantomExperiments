var Promise = require('bluebird');
var phantomfs = require("fs");
var BasicPage = require('./basicPage');
var pageUtils = require('./pageUtils');
var Resource = require('./resource');

// pre-load all page definitions in pages subfolder
var knownPages;

function BrowserController(pageDir, browserControllerDir, logger){
	var self = this;

	self.phantomPage = require('webpage').create();
	self.logger = logger;
	self.ignorableErrors = [];
	self.pageDirectory = pageDir;

	self.preloadPagesDefinitions = function(){
		if(knownPages != null)
			return;

		var totalPath = phantomfs.workingDirectory + '/' + self.pageDirectory;
		self.logger.debug(2,'preloadPages','Preloading page definitions from: ' + totalPath);
		knownPages = [];
		phantomfs.list(totalPath).forEach(function(file) {
			if(file != "." && file != ".."){
				self.logger.debug(2,'preloadPages',' - adding ' + file);
				var page = require(totalPath  + "/" + file);
				knownPages.push(page);
			}
		});
		self.logger.debug(2,'preloadPages','Page definitions loaded');
	};

	self.goToUrl = function(url){
		self.logger.debug(1,'goToUrl', url);

		return self.loadNewPage(function(){
			self.phantomPage.open(url);
		});
	};

	self.loadNewPage = function(navigationAction){
		return new Promise(function(resolve, reject){
			self.preloadPagesDefinitions();

			var newUrlCalledYet = false;

			// setup to capture error conditions
			self.phantomPage.onResourceTimeout = function(request) {
				self.logger.debug(2, 'onResourceTimeout', 'Response (#' + request.id + '): ' + JSON.stringify(request));
				reject('Page timed out');
			};

			self.phantomPage.onResourceError = function(resourceError) {
				if(self.isIgnorableError(resourceError.url)){
					self.logger.debug(3, 'onResourceError', '(Ignored) Resource Error: Unable to load resource (#' + resourceError.id + 'URL:' + resourceError.url + ')');
					self.logger.debug(3, 'onResourceError', '(Ignored) Error code: ' + resourceError.errorCode + '. Description: ' + resourceError.errorString);
					return;
				}

				self.logger.debug(0, 'onResourceError', 'Unable to load resource (#' + resourceError.id + 'URL:' + resourceError.url + ')');
				self.logger.debug(0, 'onResourceError', 'Error code: ' + resourceError.errorCode + '. Description: ' + resourceError.errorString);
				reject('Page load error');
			};
	
			setTimeout(function(){
				if(!currentPage.isLoaded){
					reject('After 15 seconds I gave up');
				}
			}, 15000);
			
			self.isIgnorableError = function(msg){
				return _.some(self.ignorableErrors, function(ignorableError){
					return msg.match(ignorableError);
				});
			};

			self.phantomPage.onError = function(msg, trace){
				if(self.isIgnorableError(msg)){

					self.logger.debug(3, 'onError', '(Ignored) Browser script error occurred. Message: ' + msg);
					return;
				}

				var traceContent = _.map(trace, function(t){
					return ' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function +'")' : '');
				});

				self.logger.error('onError', 'Browser script error occurred.\nMessage: ' + msg + '\nTrace:\n' + traceContent.join('\n'));
				reject('Browser script error occurred.\nMessage: ' + msg + '\nTrace:\n' + traceContent.join('\n'));
			};

			// setup to capture when page load finishes
			self.phantomPage.onLoadFinished = function(status){
				if(!newUrlCalledYet)
				{
					self.logger.debug(3, 'onLoadFinished', '(Ignored) onLoadFinished: URL did not change - Page "' + self.phantomPage.url + '" loaded with status ' + status);
				}
				else
				{
					try{
						self.logger.debug(1, 'onLoadFinished', 'Page "' + self.phantomPage.url + '" loaded with status ' + status);
						self.logger.debug(2, 'onLoadFinished', 'Actual URL: ' + pageUtils.getUrl(self.phantomPage));
						currentPage.setLoaded(status);

						//if(status !== "success"){
						//	reject("Return status was '" + status + "'");
						//}

						if(status === "success")
							resolve(currentPage);
					}
					catch(err){
						reject(err);
					}
				}
			};

			// track navigation and information events
			self.phantomPage.onNavigationRequested = function(url, type, willNavigate, main) {
				//console.log('NAVIGATION: { url: "' + url + '", type: "' + type + '", willNavigate: ' + willNavigate+ ', mainFrame: ' + main + ' }');
			};

			self.phantomPage.onResourceReceived = function(response) {
				//if (response.stage !== "end") return;
				//console.log('RESPONSE (#' + response.id + ', stage "' + response.stage + '"): ' + response.url);
				currentPage.addResource(new Resource({ id: response.id, endTime: Date.now(), size: 0, status: response.status, size: response.bodySize }));
			};

			self.phantomPage.onResourceRequested = function(requestData, networkRequest) {
				//console.log('REQUEST (#' + requestData.id + '): ' + requestData.url);
				currentPage.addResource(new Resource({ id: requestData.id, startTime: Date.now(), endTime: Date.now(), size: 0 }));
			};

			self.phantomPage.onUrlChanged = function(targetUrl) {
				self.logger.debug(1, 'onUrlChanged', 'Going to ' + targetUrl);
				newUrlCalledYet = true;
			};

			self.phantomPage.onConsoleMessage = function (msg, line, source) {
				self.logger.debug(2, 'onConsoleMessage', '> ' + msg);
			};

			// execute navigation action
			var currentPage = new BasicPage(self.phantomPage, logger);
			//self.logger.debug("Stopping previous load?");
			//self.phantomPage.stop();
			self.logger.debug(2, 'loadNewPage', 'Starting navigation action');
			navigationAction();

		}).then(function(currentPage){
			// attach pageutils
			self.logger.debug(2, 'loadNewPage', 'Attaching page utilities (for instrumenting browser via jQuery)');

			return pageUtils.initializeUtils(self.phantomPage, browserControllerDir).then(function(feedback){
				self.logger.debug(2, 'loadNewPage', 'Initialize page utils: ' + feedback);
				return currentPage;
			});

		}).then(function(currentPage){

			var url = self.phantomPage.url;
			_.forEach(knownPages, function(knownPage){
				if(url.match(knownPage.pattern)){
					self.logger.debug(2, 'loadNewPage', ' - attaching ' + knownPage.name + ': ' + knownPage.description);
					knownPage.attachBehavior(currentPage, self.phantomPage, self.loadNewPage);
				}
			});

			return currentPage;
		}).then(function(currentPage){
			// based on the URL, attach appropriate page behavior for this URL
			self.logger.debug(2, 'loadNewPage', 'Adding page-specific behavior');

			return currentPage;
		});
	};

}

module.exports = BrowserController;