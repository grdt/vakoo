/**
 * @constructor
 * @extends CoreAdminController
 */
var ShopProductsAdminController = function(){
	var that = this;

	const PRODUCT = 'product';

	const PER_PAGE = 50;

	this.VIEW_NAMESPACE = 'product';

	/**
	 * @param {Object=} where
	 * @returns ShopProductModel class
	 */
	function productModel(where){
		var model = that.model(PRODUCT);
		if(typeof where != "undefined"){
			model.where(where);
		}
		return model;
	}

	const CATEGORY = 'category';

	/**
	 * @param {Object=} where
	 * @returns ShopCategoryModel class
	 */
	function categoryModel(where){
		var model = that.model(CATEGORY);
		if(typeof where != "undefined"){
			model.where(where);
		}
		return model;
	}
	
	function getCategoryTree(callback){
		that.model('category').find(function(categories){
			categories = that.option().controller('categories').tree(categories);
			callback(categories);
		});
	}

	this.index = function(){
		getCategoryTree(function(categories){
			var where = {},
				data = {categories:categories, noCategory: false};

			categoryModel({_id:that.get('category','')}).findOne(function(category){
				if(category._id){
					where = {ancestors:category._id};
					data.category = category;
				}

				if(that.get('category') == 'none'){
					where = {category:''};
					data.noCategory = true;
				}

				that.module('pagination').get(productModel(where),PER_PAGE,that.get('p',0),function(products, pagination){
					data.pagination = pagination;
					data.products = products;

					that.display('list',data);
				});
			});
		});
	}

	this.edit = function(){
		productModel({_id:this.get('id','')}).findOne(function(product){
			that.display('form',product);
		});
	}

}

module.exports = ShopProductsAdminController;