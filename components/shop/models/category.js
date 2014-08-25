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

	this.url = function(){
		var sep = '/';
//		if(query && query.city){
//			sep = '/' + query.city.alias + '-';
//		}
		var url = sep + ((this.ancestors.length) ? this.ancestors.join('/') + '/' : '') + this._id;
		return url;
	}

	this.beforeSave = function(done){
		if(this.parent){
			this.setParent(done);
		}else{
			done();
		}
	}

	this.beforeInsert = function(done){
		if(this.parent){
			this.setParent(done);
		}else{
			done();
		}
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