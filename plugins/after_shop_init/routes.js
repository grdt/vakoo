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

		if(this.vakoo.isProduction()){

			that.option('shop').model('category').find(function(categories){
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

				console.log('categories routes enabled');
			});

			var async = require("async");
			var cursor = that.option('shop').model('product').collection().find({category:{$ne:''}},{ancestors:1,alias:1})
			cursor.each(function(err,object){
				if(object === null){
					console.log('products routes enabled');
				}else{
					var route_string = '/' + object.ancestors.join('/') + '/' + object.alias;
					var route = Susanin.Route(route_string);
					route.executor = {
						option:"shop",
						controller:"products",
						method:"index",
						id:object._id
					}
					$p.addRoute(route);
				}
			})

			that.option('content').model('page').find(function(pages){
				pages.forEach(function(page){
					var route_string = page.url();
					var route = Susanin.Route(route_string);
					route.executor = {
						option:"content",
						controller:"controller",
						method:"article",
						id:page._id
					}
					$p.addRoute(route);
				});

				console.log('pages routes enabled');
			});

		}
	}

}

module.exports = Plugin;