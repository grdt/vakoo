/**
 * @class ShopProductModel
 * @extends CoreModel
 */
var ShopProductModel = function () {

	this.COLLECTION_NAME = 'products';

	this._id = '';

	this.title = '';

	this.alias = '';

	this.category = '';

	this.ancestors = [];

	this.price = 0;

	this.tradePrice = 0;

	this.sku = '';

	this.desc = '';

	this.shortDesc = '';

	this.status = 'active';

	this.available = false;

	this.params = [];

	this.size = {
		current:'XS-L',
		sizes:{}
	};

	this.group = {
		current:'',
		groups:[]
	};

	this.videos = [];

	this.image = '';

	this.images = [];

	this.import = {
		id: 0,
		categoryId: 0
	}

	this.url = function () {
		return '/' + this.ancestors.join('/') + '/' + this.alias;
	}

}

module.exports = ShopProductModel;