/**
 * @class ShopCategoriesAdminController
 * @extends CoreAdminController
 */
var ShopCategoriesAdminController = function(){

	var that = this;

	const CATEGORY = 'category';

	this.VIEW_NAMESPACE = 'category';

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

	this.index = function(){
		var tree = this.get('view') == 'tree',
			view = (tree) ? 'tree' : 'list';

		this.model('category').find(function(categories){
			if(tree){
				categories = that.tree(categories, true);
			}
			that.display(view,{categories:categories});
		});
	}

	this.loadProducts = function(){
		this.cleanTimeout();
		var link = this.get('link') + '?show_by=3000',
			http = require('http'),
			html = '',
			jquery = fs.readFileSync(that.APP_PATH + '/public/js/jquery.js').toString(),
			jsdom  = require('jsdom');

		console.log(link);
		http.get(link,function(res){
			res.setEncoding('utf8');
			res.on('data', function (chunk) {
				html += chunk;
			});

			res.on('end',function(){
				
				console.log('html recieved');
				
				jsdom.env({
					html:html,
					src:[jquery],
					done:function(error,window){
						if(error){
							console.log(error.code);
							return;
						}

						var $ = window.$;

						var sku = [];

						var result = {findedOnPage:0,added:0};

						$(".price").each(function(){
							var id = $(this).attr('id').replace('product-price-','')*1;
							if(id > 0){
								sku.push(id);
							}
						});

						$ = null;
						window = null;

						console.log(result);


						if(sku.length){
							result.findedOnPage = sku.length;

							console.log('res',result);

							that.model('product').where({sku:{$in:sku}}).find(function(products){
								console.log('products',products.length);

								result.added = products.length;

								products.forEach(function(product){
									process.nextTick(function() {
										product.setCategory(that.get('id'));
									});
								});

								that.json(result);
							});
						}

					}
				});

			});
		}).end();
	}

	this.changeParent = function(){
		if(this.isAjax()){
			var model = this.model('category');

			model.where({_id:this.get('id')}).findOne(function(category){
				categoryModel().find(function(categories){
					var cats = [];
					categories.forEach(function(cat){
						cat.selected = (cat._id == category.parent);
						if(cat._id != category._id){
							cats.push(cat);
						}
					});

					cats = that.tree(cats);

					that.tmpl().render('category.parent',{category:category,categories:cats});
				});
			});

			return;
		}

		if(this.post()){
            console.log("hello", this.post())
			this.model('category').where({_id:this.get('id')}).findOne(function(category){
				that.model('category').where({_id:that.post('parent')}).findOne(function(parent){
					var catAncestors = parent.ancestors.clone();
					catAncestors.push(parent._id)
					var prodAncestors = catAncestors.clone();
					prodAncestors.push(category._id);
					category.ancestors = catAncestors;
					category.parent = parent._id;

                    console.log(category);

					category.save();

					that.setFlash('success','Категория сохранена');

					that.model('product').where({category:category._id}).find(function(products){
						products.forEach(function(product){
							product.ancestors = prodAncestors;
							product.save();
						});

						that.back();

					});

				});
			});
		}
	}

	this.edit = function(){
		this.createReturnUrl();

		categoryModel({_id:this.get('id','')}).findOne(function(category){
			if(that.post()){
				category.setAttributes(that.post());

				if(!that.get('id')){
					if(!that.post('_id')){
						category.createId();
					}
					categoryModel({_id:category._id}).findOne(function(already){
						if(already._id){
							that.setFlash('error','Категория с таким ID уже существует');
							category._id = null;
							that.back();
						}else{
                            category.setParent(function() {
                                category.insert(function () {
                                    that.setFlash('success', 'Категория сохранена');
                                    if (that.post('exit') == '1') {
                                        that.back();
                                    } else {
                                        that.redirect(that.query.mergeUrl('/admin/?task=shop.categories/edit&id=' + category._id, {"return": that.get('return', 'false')}));
                                    }
                                });
                            });
						}
					});
				}else{
					category.save(function(){
						that.setFlash('success','Категория сохранена');
                        category.setParent(function() {
                            if (that.post('exit') == '1') {
                                that.back();
                            } else {
                                categoryModel().find(function (categories) {
                                    categories.forEach(function (cat) {
                                        if (that.get('parent') == cat._id) {
                                            cat.selected = true;
                                        }
                                    });
                                    categories = that.tree(categories);
                                    that.display('form', {category: category, categories: categories});
                                });
                            }
                        });
					});
				}
			}else{
				categoryModel().find(function(categories){
					categories.forEach(function(cat){
						if(that.get('parent')){
							if(that.get('parent') == cat._id){
								cat.selected = true;
							}
						}else{
							if(category.parent == cat._id){
								cat.selected = true;
							}
						}


					});
					categories = that.tree(categories);

					if(!category._id){
						category.title = that.get('title');
					}

					that.display('form',{category:category, categories:categories});
				});
			}
		});
	}

	/**
	 * @param {ShopCategoryModel[]} categories
	 * @returns {Array}
	 */
	this.tree = function(categories, withCount){

        console.log("start tree")
		var tree = [];

		if(typeof withCount == "undefined"){
			withCount = false;
		}
		
		categories.sort(function(a,b){
			return a.ancestors.length - b.ancestors.length;
		});

		categories.forEach(function(category){
			var parent;

//			that.model('product').where({ancestors:category._id}).count(function(count){

			var count = 0;

				if(category.ancestors.length == 0){
                    console.log(category._id)
					tree[category._id] = category.clean();
					tree[category._id].selected = category.selected;
					tree[category._id].path = category.url();
					tree[category._id].count = count;
					tree[category._id].childs = [];
				}else{
					parent = tree[category.ancestors[0]];
					if(category.ancestors.length > 1){
						for(key in category.ancestors){
							if(parent && typeof parent.childs[category.ancestors[key]] != "undefined"){
								parent = (parent) ? parent.childs[category.ancestors[key]] : false;
							}
						}
						if(parent){
							parent.childs[category._id] = category.clean();
							parent.childs[category._id].selected = category.selected;
							parent.childs[category._id].path = category.url();
							parent.childs[category._id].count = count;
							parent.childs[category._id].childs = [];
						}else{
							tree[category._id] = category.clean();
							tree[category._id].selected = category.selected;
							tree[category._id].path = category.url();
							tree[category._id].count = count;
							tree[category._id].childs = [];
						}
					}else{
						if(parent){
							parent.childs[category._id] = category.clean();
							parent.childs[category._id].selected = category.selected;
							parent.childs[category._id].path = category.url();
							parent.childs[category._id].count = count;
							parent.childs[category._id].childs = [];
						}else{
							tree[category._id] = category.clean();
							tree[category._id].selected = category.selected;
							tree[category._id].path = category.url();
							tree[category._id].count = count;
							tree[category._id].childs = [];
						}
					}
				}
//			})


		});
		
		return tree;
	}
}


module.exports = ShopCategoriesAdminController;