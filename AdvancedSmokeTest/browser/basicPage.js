var Resource = require('./resource');

function BasicPage(page, logger){
	var self = this;

	self.page = page;
	self.logger = logger;
	self.isLoaded = false;
	self.startLoadTime = Date.now();
	self.resources = {};

	self.setLoaded = function(status){
		var loadSpeed = Date.now() - self.startLoadTime;
		isLoaded = true;
		logger.debug(1, 'setLoaded', 'Page loaded in ' + loadSpeed + 'ms :: ' + self.getUrl());
	};

	self.addResource = function(downloadedResource){
		if(self.resources[downloadedResource.id] != null){
			self.resources[downloadedResource.id].add(downloadedResource);
		}
		else{
			self.resources[downloadedResource.id] = downloadedResource;
		}
	};

	self.getTitle = function(){ return self.page.title; };
	self.getUrl = function(){ return self.page.url; };
}

BasicPage.prototype.toString = function(){
	return '[object BasicPage:{ "loaded": "' + this.isLoaded + '", "url": "' + this.getUrl() + '", "title": "' + this.getTitle() + '" }]';
};

module.exports = BasicPage;
