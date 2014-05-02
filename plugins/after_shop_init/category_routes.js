var Susanin = require('susanin');
var Plugin = function(){

	this._init = false;

	var $p = this;

	this.init = function(){
		this.option('shop').model('category').find(function(categories){
			categories.forEach(function(category){
				var route_string = category.ancestors.join('/').replace('svet','');
				var route = Susanin.Route(route_string + '/' + category._id);
				route.executor = {
					option:"shop",
					controller:"categories",
					method:"index",
					id:category._id
				}
				$p.addRoute(route);
			});
		});
	}
}

module.exports = Plugin;