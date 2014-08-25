var Plugin = function(){
	var $p = this;

	this.callback = false;

	this.init = function($l,view,data,callback,next){
		if(typeof data == "undefined"){
			data = {};
		}
		
			this.option('shop').model('category',$l.from.query).find(function(categories){

			data["catalog:menu"] = {categories:categories};
			data["catalog:breadcrumbs"] = {categories:categories};

			if(typeof callback == "function"){
				callback($l,view,data,next);
			}
		});
	}
}

module.exports = Plugin;