var Plugin = function(){
	var $p = this;

	this.callback = false;

	this.init = function(){

		var $l = arguments[0][0];
		var loader = this.load;
		var vakoo = this;
		var next = arguments[1];
		var categories;

		if(categories = vakoo.memory('all-categories')){
			$l._data["catalog:menu"] = {categories:categories};
			$l._data["catalog:breadcrumbs"] = {categories:categories};
			if(typeof next == "function"){
				next();
			}
		}else{
			loader.option('shop').model('category',$l.from.query).find(function(categories){
//				vakoo.memory('all-categories',categories);
				$l._data["catalog:menu"] = {categories:categories};
				$l._data["catalog:breadcrumbs"] = {categories:categories};

				if(typeof next == "function"){
					next();
				}
			});
		}


	}
}

module.exports = Plugin;