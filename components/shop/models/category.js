/**
 * @class ShopCategoryModel
 * @extends CoreModel
 */
var ShopCategoryModel = function(query){

	var that = this;

	const imageObject = {
		id:'',
		name:'',
		alt:'',
		path:''
	};

	const metaObject = {
		description:'',
		title:'',
		keywords:''
	};

	this.COLLECTION_NAME = 'categories';

	this._id = '';

	this.title = '';

	this.description = '';

	this.anonce = '';

	this.image = imageObject;

	this.meta = metaObject;

	this.mainImage = imageObject;

	this.mainSmallImage = imageObject;

	this.main = false;

	this.ancestors = [];

	this.parent = '';

	this.import = {
		id:0,
		parent_id:0
	}

	this.createId = function(){
		this._id = translit(this.title);
		return this;
	}

	this.url = function(sublink){
		if(this.vakoo.ENVIRONMENT == 'development'){
			var link = '/shop/categories/index?id=' + this._id;
			if(sublink){
				link += '&' + sublink;
			}

			return link;
		}
		var sep = '/';
		var url = sep + ((this.ancestors.length) ? this.ancestors.join('/') + '/' : '') + this._id;
		if(sublink){
			url += '?' + sublink;
		}
		return url;
	}

//	this.beforeSave = function(done){
//		if(this.parent){
//			this.setParent(done);
//		}else{
//			done();
//		}
//	}
//
//	this.beforeInsert = function(done){
//		if(this.parent){
//			this.setParent(done);
//		}else{
//			done();
//		}
//	}

	this.afterFind = function(done){
		if(!this.meta.title){
			this.meta.title = this.title;
		}

		if(!this.meta.description){
			this.meta.description = this.description;
		}

		if(!this.meta.keywords){
			this.meta.keywords = this.description;
		}

		done();
	}

	this.setParent = function(done){
		this.option('shop').model('category').where({_id:this.parent}).findOne(function(parent){
			var catAncestors = parent.ancestors.clone();
			catAncestors.push(parent._id)
			var prodAncestors = catAncestors.clone();
			prodAncestors.push(that._id);
			that.ancestors = catAncestors;
			that.parent = parent._id;

			that.save();

			that.option('shop').model('product').where({category:that._id}).find(function(products){
				products.forEach(function(product){
					product.ancestors = prodAncestors;
					product.save();
				});

				done();

			});

		});
	}
}

module.exports = ShopCategoryModel;