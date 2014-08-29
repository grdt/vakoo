var Controller = function(){

	var $c = this;
	var that = this;

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
		if(this.isAjax() && this.post()){

			var order = this.model('order'),
				cart = this.model('cart',this);

			order.setAttributes(this.post());

			if(this.post('id')){
				this.model('product').where({_id:this.post('id')}).findOne(function(product){
					var item = product.clean('params');
					item.count = order.productCount = 1;
					item.total = order.total = product.price;
					order.products.push(item);
					order.save(function(){
						that.json({success:true});
					});

				});
			}else{
				for(var key in cart.products){
					order.products.push(cart.products[key]);
				}

				order.productCount = cart.count;
				order.total = cart.total;
				order.save(function(){
					cart.clean();
					that.json({success:true});
				});

			}
		}else{
			this.where();
		}
	}

	this.clean = function(){
		this.model('cart',this).clean();
		this.json({success:true});
	}

	this.form = function(){
		if(!this.isAjax()){
			this.exception(403,'Access Denied');
			return;
		}

		if(this.get('id')){
			this.model('product').where({_id:this.get('id')}).findOne(function(product){
				$c.tmpl().render('modals.checkout',{product:product,total:product.price,count:1,title:product.title});
			});
		}else{
			var cart = this.model('cart',this);
			var params = cart.clone();
			params.title = 'Оформление заказа';
			$c.tmpl().render('modals.checkout',params);
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