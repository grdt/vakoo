var Product = require('./product.js');

var Cart = function($c){
	this.products = {};
	
	this.total = 0;
	
	this.count = 0;
	
	this.lastModified = new Date();
	
	this.save = function(){
		
	}
	
	this.set = function(product,modification){
		if(product instanceof Product){
			var item;
			if(typeof this.products[product._id] != "undefined"){
				item = 	this.products[product._id];
			}else{
				item = product.clean('params');
				delete item.import;
				item.count = 0;
				item.total = 0;
				this.products[product._id] = item;
			}

			if(this.modificate(item,modification)){
				return this.calculate();
			}else return false;
		}else{
			return false;
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
					item.count = modification.replace('-','')*1
				}
			}
		}else{
			item.count = modification*1;
		}

		if(item.count == 0){
			delete this.products[item._id];
		}else{
			item.total = item.price * item.count;
		}
		return true;
	}

	this.calculate = function(){
		this.total = 0;
		this.count = 0;
		for(var key in this.products){
			this.count += this.products[key].count;
			this.total += this.products[key].total;
		}
		return true;
	}
	
	this.data = function(){
		return {total:this.total,count:this.count};
	}

	this.save = function(){
		this.lastModified = new Date();
		$c.session('cart',this);
		return true;
	}

	var cart;
	if(cart = $c.session('cart')){
		for(var key in cart){
			this[key] = cart[key];
		}
	}
}

module.exports = Cart;