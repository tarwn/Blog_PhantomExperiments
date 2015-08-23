function Resource(values){
	var self = this;

	self.id = values.id;
	self.startTime = values.startTime;
	self.endTime = values.endTime;
	self.size = values.size || 0;
	self.status = values.status;

	self.add = function(updatedValues){
		if(updatedValues.endTime != null)
			self.endTime = updatedValues.endTime;

		if(updatedValues.size != null)
			self.size += updatedValues.size;

		if(updatedValues.status != null)
			self.status = updatedValues.status;
	};
}

module.exports = Resource;