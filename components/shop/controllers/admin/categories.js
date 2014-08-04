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
				categories = that.tree(categories);
			}
			that.display(view,{categories:categories});
		});
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
			this.model('category').where({_id:this.get('id')}).findOne(function(category){
				that.model('category').where({_id:that.post('parent')}).findOne(function(parent){
					var catAncestors = parent.ancestors.clone();
					catAncestors.push(parent._id)
					var prodAncestors = catAncestors.clone();
					prodAncestors.push(category._id);
					category.ancestors = catAncestors;
					category.parent = parent._id;

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
						}else{
							category.insert();
							that.setFlash('success','Категория сохранена');
							that.redirect(that.query.mergeUrl('/admin/?task=shop.categories/edit&id=' + category._id,{"return":that.get('return','false')}));
						}
					});
				}else{
					category.save();
					that.setFlash('success','Категория сохранена');
					if(that.post('exit') == '1'){
						that.back();
					}
				}
			}
			that.display('form',{category:category});
		});
	}

	/**
	 * @param {ShopCategoryModel[]} categories
	 * @returns {Array}
	 */
	this.tree = function(categories){
		var tree = [];
		
		categories.sort(function(a,b){
			return a.ancestors.length - b.ancestors.length;
		});

		categories.forEach(function(category){
			var parent;

			if(category.ancestors.length == 0){
				tree[category._id] = category.clean();
				tree[category._id].selected = category.selected;
				tree[category._id].path = category.url();
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
						parent.childs[category._id].childs = [];
					}else{
						tree[category._id] = category.clean();
						tree[category._id].selected = category.selected;
						tree[category._id].path = category.url();
						tree[category._id].childs = [];
					}
				}else{
					if(parent){
						parent.childs[category._id] = category.clean();
						parent.childs[category._id].selected = category.selected;
						parent.childs[category._id].path = category.url();
						parent.childs[category._id].childs = [];
					}else{
						tree[category._id] = category.clean();
						tree[category._id].selected = category.selected;
						tree[category._id].path = category.url();
						tree[category._id].childs = [];
					}
				}
			}
		});
		
		return tree;
	}
}


module.exports = ShopCategoriesAdminController;