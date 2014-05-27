var Product = function(){

	this.COLLECTION_NAME = 'products';

	this._id = '';

	this.title = '';

	this.alias = '';

	this.category = '';

	this.ancestors = [];

	this.price = 0;

	this.image = '';

	this.sku = '';

	this.desc = '';

	this.status = 'active';

	this.params = [];

	this.import = {
		id:0,
		categoryId:0
	}

	this.url = function(){
		return '/' + this.ancestors.join('/') + '/' + this.alias;
	}

}

module.exports = Product;