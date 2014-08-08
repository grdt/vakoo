var Susanin = require('susanin');
var Plugin = function(){

	this._init = false;

	var $p = this;

	var that = this;

	const CATEGORY = 'category';

	this.title = 'trololo';

	/**
	 * @param {Object=} where
	 * @returns ShopCategoryModel class
	 */
	function categoryModel(where){
		var model = that.option('shop').model(CATEGORY);
		if(typeof where != "undefined"){
			model.where(where);
		}
		return model;
	}

	const PRODUCT = 'product';

	/**
	 * @param {Object=} where
	 * @returns ShopProductModel class
	 */
	function productModel(where){
		var model = that.option('shop').model(PRODUCT);
		if(typeof where != "undefined"){
			model.where(where);
		}
		return model;
	}

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


		this.option('shop').model('product').where({category:{$ne:''}}).find(function(products){
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