var Plugin = function(){
	var $p = this;
	this.init = function(view,data,callback){
		if(typeof data == "undefined"){
			data = {};
		}
		this.option('shop').model('category').find(function(categories){
			if(typeof data["catalog:menu"] == "undefined"){
				data["catalog:menu"] = {};
			}
			data["catalog:menu"].categories = categories;

			if(typeof callback == "function"){
				callback(data);
			}
		});
	}
}

module.exports = Plugin;