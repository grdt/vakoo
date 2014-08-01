/**
 * @constructor
 * @extends {CoreController}
 */
var ShopCategoriesController = function(){
	var $c = this;

	this.index = function(){
		this.model('category').where({_id:this.get('id')}).findOne(function(category){
			if(category._id){

				var subs = [];
				var subsubs = [];

				var data = {
					title:category.title,
					category:category
				};

				var where = {parent:category._id};

				if(category.parent){
					where = {$or:[where,{parent:category.parent}]};
				}

				$c.model('category').where(where).find(function(subcategories){

					if(subcategories && subcategories.length){

						subcategories.forEach(function(subcat){
							if(subcat._id == category._id){
								subcat.active = true;
							}

							if(subcat.parent != category._id){
								subs.push(subcat);
							}else{
								subsubs.push(subcat);
							}
						});
					}

					data.categories = (subsubs.length) ? subsubs : subs;

					$c.model('product').where({ancestors:category._id}).count(function(count){

						data.productCount = count;

						if($c.config.product.perPage < count){
							$c.model('product')
								.where({ancestors:category._id})
								.limit($c.get('p') * $c.config.product.perPage,$c.config.product.perPage)
								.find(function(products){
									data.products = products;
									data.pagination = {page:$c.get('p')*1 + 1,count:count,perPage:$c.config.product.perPage};
									$c.tmpl().display('category',data);
							});
						}else{
							$c.model('product')
								.where({ancestors:category._id})
								.find(function(products){
									data.products = products;
									$c.tmpl().display('category',data);
							});
						}
					});
				});
				
				
			}
		});
	}

}

module.exports = ShopCategoriesController;