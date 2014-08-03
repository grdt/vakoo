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
	
	function getCategoryTree(selected, callback){
		if(typeof selected == "function" && typeof callback == "undefined"){
			callback = selected;
			selected = false;
		}
		that.model('category').find(function(categories){
			if(selected){
				categories.forEach(function(category){
					if(category._id == selected){
						category.selected = true;
					}else{
						category.selected = false;
					}
				});
			}
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

		this.createReturnUrl();

		var where;

		if(!this.get('id') && this.get('sku')){
			where = {sku:this.get('sku')};
		}else{
			where = {_id:this.get('id')};
		}

		productModel(where).findOne(function(product){
			if(that.post()){
				product.setAttributes(that.post()).save();
				that.setFlash('success','Товар сохранен');
				if(that.post('exit') == '1'){
					that.back();
				}
			}

			getCategoryTree(product.category,function(categories){
				that.display('form',{product:product,categories:categories});
			});
		});
	}

}

module.exports = ShopProductsAdminController;