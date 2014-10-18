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

				if(that.get('error') == "1"){
					where = {"$or":[{"title":/�/i},{"shortDesc":/�/i},{"desc":/�/i}]};
					data.withError = true;
				}

				that.module('pagination').get(productModel(where).order({"available":-1}),PER_PAGE,that.get('p',0),function(products, pagination){
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

	this.update = function(){
		this.cleanTimeout();
		productModel({_id:this.get('id')}).findOne(function(product){
			product.getActualInfo(function(data){
				that.json(data);
			});
		});
	}

	const imageObject = {
		id:'id',
		name:'name',
		alt:'alt',
		path:''
	};

//	this.afterFindAll = function(){
//
//		var col = productModel().collection();
//		var bulk = col.initializeUnorderedBulkOp();
//		productModel().where({images:new RegExp('//')}).find(function(products){
//			products.forEach(function(product, p, parray){
//				if(_.isString(product.image)){
//
//					console.log('product',product._id);
//
//					var originalName = _.last(product.image.split('/'));
//					/** @type FileModel fileModel */
//					var fileModel = that.option('file').model('file');
//					fileModel.where({originalName:originalName}).findOne(function(file){
//						if(file._id){
//							var image = imageObject.clone();
//							image.id = file._id;
//							image.path = file.path;
//							image.name = file.name;
//							image.alt = product.title + ' ' + product.shortDesc;
//							bulk.find({_id:product._id}).updateOne({$set:{image:image}});
//						}
//
//						var plast = (p == (parray.length - 1));
//
//						if(plast && !product.images.length){
//							console.log('start bulk');
//							bulk.execute(function(err,res){
//								if(err){
//									console.log(err);
//								}
//								console.log(res.ok);
//							})
//						}
//
//					});
//				}
//
//				if(_.isArray(product.images) && product.images.length){
//
//					console.log('product images',product._id);
//
//					var images = [];
//
//					var originalImages = product.images.clone();
//
//					product.images.forEach(function(pimage, i, array){
//
//						var last = (i == (array.length - 1));
//						var plast = (p == (parray.length - 1));
//
//						if(_.isString(pimage)){
//							var originalName = _.last(pimage.split('/'));
//							/** @type FileModel fileModel */
//							var fileModel = that.option('file').model('file');
//							fileModel.where({originalName:originalName}).findOne(function(file){
//
//								var last = (i == (array.length - 1));
//								var plast = (p == (parray.length - 1));
//
//								if(file._id){
//									var image = imageObject.clone();
//									image.id = file._id;
//									image.path = file.path;
//									image.name = file.name;
//									image.alt = product.title + ' ' + product.shortDesc;
//									images.push(image);
//									if(last && plast){
//										setTimeout(function(){
//											if(images.length == originalImages.length){
//												bulk.find({_id:product._id}).updateOne({$set:{images:images}});
//
//												if(plast){
//													console.log('start bulk');
//													bulk.execute(function(err,res){
//														if(err){
//															console.log(err);
//														}
//														console.log(res.ok);
//													})
//												}
//
//											}
//										},1000);
//									}
//
//								}else{
//									console.log('not found file');
//								}
//							});
//						}else{
//							images.push(pimage);
//							if(last && images.length == originalImages.length){
//								bulk.find({_id:product._id}).updateOne({$set:{images:images}});
//
//								if(plast){
//									console.log('start bulk');
//									bulk.execute(function(err,res){
//										if(err){
//											console.log(err);
//										}
//										console.log(res.ok);
//									})
//								}
//							}
//						}
//					})
//				}
//			});
//
//		})
//	}


}

module.exports = ShopProductsAdminController;