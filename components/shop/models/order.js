/**
 * @extends CoreModel
 * @constructor
 */
var OrderModel = function(){

	var that = this;

	const STATUSES = {
		"new":'Новый',
		spam:'Спам',
		cancelled:'Отменен',
		approved:'Подтвержден',
		sent:'Отправлен',
		obtained:'Получен',
		completed:'Завершен'
	};

	this.COLLECTION_NAME = 'orders';

	this._id = '';

	this.name = {};

	this.fullname = ''

	this.address = {};

	this.fulladdress = '';

	this.contact = '';

	this.email = '';

	this.phone = '';

	this.skype = '';

	this.products = [];

	this.productCount = 0;

	this.total = 0;

	this.status = 'new';

	this.comment = '';

	this.adminComment = '';

	this.date = new Date();

	this._statuses = function(type,argument){
		var key = (typeof type == "function" && typeof argument != "undefined") ? type(argument) : type;
		if(typeof key != "undefined"){
			return STATUSES[key] || ((argument) ? 'Все' : false);
		}else{
			return STATUSES;
		}
	}

	this.tradeSum = function(){
		var sum = 0;
		if(this.products.length){
			this.products.forEach(function(product){
				sum += product.count * product.tradePrice;
			});
		}
		return sum;
	}


}

module.exports = OrderModel;