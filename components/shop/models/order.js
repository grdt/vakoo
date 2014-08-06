var Order = function(){

	this.COLLECTION_NAME = 'orders';

	this._id = '';

	this.name = '';

	this.contact = '';

	this.address = '';

	this.products = [];

	this.count = 0;

	this.total = 0;

	this.status = 'new';

	this.comment = '';

	this.date = new Date();

}

module.exports = Order;