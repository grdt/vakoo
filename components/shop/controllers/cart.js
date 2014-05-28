var Controller = function(){

	var $c = this;

	this.index = function(){
		if(!this.isAjax()){
			this.exception(403,'Access Denied');
			return;
		}

		var cart = this.model('cart',this);
		this.tmpl().render('modals.cart',cart);
	}

	this.add = function(){
		if(!this.isAjax()){
			this.exception(403,'Access Denied');
			return;
		}
		
		if(this.post()){
			var cart = this.model('cart',this);
			if(this.post('id')){
				this.model('product').where({_id:this.post('id')}).findOne(function(product){
					if(cart.set(product, $c.post('value'))){
						cart.save();
						$c.json(cart.data());
					}
				});
			}
		}
	}

	this.checkout = function(){
		if(!this.isAjax()){
			this.exception(403,'Access Denied');
			return;
		}

		if(this.post()){

			var order = this.model('order');

			order.name = this.post('name');
			order.contact = this.post('contact');
			order.address = this.post('address');

			if(this.post('id')){
				this.model('product').where({_id:this.post('id')}).findOne(function(product){
					var item = product.clean('params');
					item.count = order.count = 1;
					item.total = order.total = product.price;
					order.products.push(item);
					order.save();
					$c.json({success:true});
				});
			}else{
				var cart = this.model('cart');
				cart.products.forEach(function(item){
					order.products.push(item);
				});

				order.count = cart.count;
				order.total = cart.total;
				order.save();
				$c.json({success:true});
			}
		}
	}

	this.oneclick = function(){
		if(!this.isAjax()){
			this.exception(403,'Access Denied');
			return;
		}

		if(this.get('id')){
			this.model('product').where({_id:this.get('id')}).findOne(function(product){
				$c.tmpl().render('modals.cart_one_click',product);
			});
		}
	}

	this.data = function(){
		if(!this.isAjax()){
			this.exception(403,'Access Denied');
			return;
		}

		if(this.post()){
			var cart = this.model('cart',this);
			$c.json(cart.data());
		}
	}

}


module.exports = Controller;