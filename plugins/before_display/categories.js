var Plugin = function(){
	var $p = this;

	this.callback = false;

	this.init = function($l,next){

		this.option('shop').model('category',$l.from.query).find(function(categories){

			$l._data["catalog:menu"] = {categories:categories};
			$l._data["catalog:breadcrumbs"] = {categories:categories};

			if(typeof next == "function"){
				next();
			}
		});
	}
}

module.exports = Plugin;