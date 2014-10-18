var async = require("async");

/**
 * @constructor
 * @extends {CoreController}
 */
var ShopCategoriesController = function(){
	var $c = this,
		that = this;

	this.index = function(){

		this.query.logTime("run category action");

		that.model('category').where({_id:this.get('id')}).findOne(function(category){
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


				that.getRedisRecord(function(hash){
					if(hash){
						async.parallel([
							function(cb){
								that.model("category").where({_id:{$in:hash.categories}}).find(function(categories){
									data.categories = categories;
									cb();
								});
							},
							function(cb){
								var ids = [];

								hash.products.forEach(function(productId){
									ids.push(that.model("product").ObjectID(productId));
								})

								that.model("product").where({_id:{$in:ids}}).find(function(products){
									async.sortBy(products,function(product, cb){
										cb(null, hash.products.indexOf(product._id.toString()));
									},function(err, sortedProducts){
										data.products = sortedProducts;
										cb();
									})
								});
							}
						],function(err){
							that.query.logTime("display category");
							data.pagination = hash.pagination;
							that.display('category',data);
						})
					}else{
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

							that.query.logTime("prepare category display");

							var model = $c.model('product')
								.where({ancestors:category._id, status:'active'});

							var o = {available:-1};

							if(order){
								o[order[0]] = order[1] == "asc" ? 1 : -1;
							}

							model.order(o, true);

							that.module('pagination').get(model,that.config.product.perPage,that.get('p',0),function(products, pagination){
								data.pagination = pagination;
								data.products = products;

								that.storeRedisRecord(data);

								that.query.logTime("display category");
								that.display('category',data);
							});
						});
					}
				});

				
			}
		});
	}

	this.getRedisRecord = function(callback){
		if(this.vakoo.isProduction() && this.vakoo.redis && this.vakoo.redis.connected){
			this.vakoo.redis.get(this.getRedisIndex(),function(err, hash){
				if(!err){
					try{
						hash = JSON.parse(hash);
					}catch(e){
						
					}

					callback(hash)
				}else{
					callback(null)
				}
			})
		}else{
			callback(null)
		}
	}
	
	this.storeRedisRecord = function(data){

		if(this.vakoo.redis && this.vakoo.redis.connected){
			var pIds = [],
				hash = {},
				cIds = [],
				products = [],
				index = this.getRedisIndex();
			data.products.forEach(function(product){
				pIds.push(product._id.toString());
//				var p = product.clean();
//				p.url = product.url()
//				products.push(p);
			});

//			console.log(products);

			data.categories.forEach(function(category){
				cIds.push(category._id.toString());
			});

			hash.pagination = data.pagination;
			hash.products = pIds;
			hash.categories = cIds;
			this.vakoo.redis.setex(this.getRedisIndex(), 3600, JSON.stringify(hash));
		}
	}
	
	this.getRedisIndex = function(){
		return "category-" + this.get("id") + "-" + this.get("sort",0) + "-" + this.get("p",0);
	}

}

module.exports = ShopCategoriesController;