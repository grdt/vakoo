var Product = require('./product.js');
/**
 * @constructor
 */
var Cart = function($c){

	var that = this;

	this.products = {};
	
	this.total = 0;
	
	this.count = 0;
	
	this.lastModified = new Date();

	this._lastMod = {};
	
	this.set = function(product,modification){
		if(product instanceof Product){
			var item;
			if(typeof this.products[product._id] != "undefined"){
				item = 	this.products[product._id];
			}else{
				item = product.clean('params');
				item.url = product.url();
				delete item.import;
				item.count = 0;
				item.total = 0;
				this.products[product._id] = item;
			}

			if(this.modificate(item,modification)){
				return this.calculate();
			}else return this;
		}else{
			return this;
		}
	}

	this.modificate = function(item,modification){
		if(!modification || typeof modification == "undefined"){
			modification = '+1';
		}

		if(modification[0] == '+' || modification[0] == '-'){
			if(modification[0] == '+'){
				item.count += modification.replace('+','')*1;
			}else{
				if(item.count < modification.replace('-','')*1){
					item.count = 0;
				}else{
					item.count -= modification.replace('-','')*1
				}
			}
		}else{
			item.count = modification*1;
		}

		if(item.count == 0){
			this._lastMod = {_id:item._id,count:0,total:0};
			delete this.products[item._id];
		}else{
			this._lastMod = item;
			item.total = item.price * item.count;
		}
		return true;
	}

	this.delivery = function(word){
		if(this.total > this.vakoo.config().delivery.mincart){
			return (word) ? 'Бесплатно' : 0;
		}else{
			return this.vakoo.config().delivery.price;
		}
	}

	this.orderTotal = function(){
		return that.total + that.delivery();
	}

	this.calculate = function(){
		this.total = 0;
		this.count = 0;
		for(var key in this.products){
			this.count += this.products[key].count;
			this.total += this.products[key].total;
		}
		return this;
	}
	
	this.data = function(){

		var products = [];

		for(var id in this.products){
			var product = this.products[id];
			products.push({
				price:product.price,
				count:product.count,
				total:product.total,
				image:product.image,
				shortDesc:product.shortDesc,
				title:product.title,
				_id:product._id,
				url:product.url
			});
		}

		return {
			total:this.total,
			count:this.count,
			products:products,
			delivery:this.delivery(true),
			orderTotal:this.orderTotal()
		};
	}

	this.save = function(){
		this.lastModified = new Date();
		$c.session('cart',this);
		return true;
	}

	this.clean = function(){
		this.products = {};
		this.count = 0;
		this.total = 0;
		return this;
	}

	var cart;
	if(cart = $c.session('cart')){
		for(var key in cart){
			this[key] = cart[key];
		}
	}
}

module.exports = Cart;