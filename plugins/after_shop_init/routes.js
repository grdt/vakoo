var Susanin = require('susanin');
var Plugin = function(){

	this._init = false;

	var $p = this;

	this.init = function(){
		this.option('shop').model('category').find(function(categories){
			categories.forEach(function(category){

				var route_string = category.url();
				var route = Susanin.Route(route_string);
				route.executor = {
					option:"shop",
					controller:"categories",
					method:"index",
					id:category._id
				}
				$p.addRoute(route);
			});
		});


		this.option('shop').model('product').find(function(products){
			products.forEach(function(product){
				var route = Susanin.Route(product.url());
				route.executor = {
					option:"shop",
					controller:"products",
					method:"index",
					id:product._id
				}
				$p.addRoute(route);
			});
		});
	}
}

module.exports = Plugin;