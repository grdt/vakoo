/**
 * @constructor
 * @extends {CoreController}
 */
var ShopCategoriesController = function(){
	var $c = this,
		that = this;

	this.index = function(){
		this.model('category').where({_id:this.get('id')}).findOne(function(category){
			if(category._id){

				var subs = [];
				var subsubs = [];
				var sort = {
					price:{
						active:false,
						url:'sort=price,desc'
					},
					title:{
						active:false,
						url:'sort=title,desc'
					}
				};

				var order = false;


				if(that.get('sort')){
					order = that.get('sort').split(',');
					if(order[1] == 'desc'){
						sort[order[0]].active = true;
						sort[order[0]].url = 'sort=' + order[0] + ',asc';
					}
				}


				var data = {
					title:category.title,
					category:category,
					meta:category.meta,
					sort:sort
				};

				var where = {parent:category._id};

				if(category.parent){
					where = {$or:[where,{parent:category.parent}]};
				}

				if(category._id == 'dlya-nee' || category._id == 'dlya-nego'){
					where = {$or:[where,{_id:'analnaya-stimulyaciya'}]};
				}

				$c.model('category').where(where).find(function(subcategories){

					if(subcategories && subcategories.length){

						subcategories.forEach(function(subcat){
							if(subcat._id == category._id){
								subcat.active = true;
							}

							if((category._id == 'dlya-nee' || category._id == 'dlya-nego') && subcat._id == 'analnaya-stimulyaciya'){
								subsubs.push(subcat);
							}

							if(subcat.parent != category._id){
								subs.push(subcat);
							}else{
								subsubs.push(subcat);
							}
						});
					}

					data.categories = subsubs;

					$c.model('product').where({ancestors:category._id, available:true}).count(function(count){

						data.productCount = count;

						var model = $c.model('product')
									.where({ancestors:category._id, available:true});

						if(order){
							var o = {};
							o[order[0]] = order[1];
							model.order(o);
						}

						if($c.config.product.perPage < count){
							model.limit($c.get('p') * $c.config.product.perPage,$c.config.product.perPage)
								.find(function(products){
									data.products = products;
									data.pagination = {page:$c.get('p')*1 + 1,count:count,perPage:$c.config.product.perPage};
									$c.tmpl().display('category',data);
							});
						}else{
							model.find(function(products){
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