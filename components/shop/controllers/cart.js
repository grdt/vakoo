var Controller = function(){

	var $c = this;
	var that = this;

	this.index = function(){

		var cart = this.model('cart',this);
		if(this.isAjax()){
			this.tmpl().render('modals.cart',cart);
		}else{
			cart.title = 'Корзина';
			this.tmpl().display('cart',cart);
		}


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

		var order = this.model('order'),
			cart = this.model('cart',this);


		if(this.isAjax() && this.post()){

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
					cart.clean().save();
					that.json({success:true});
				});

			}
		}else{

			if(this.post()){

				if(this.post('oneclick')){

					var productId;

					for(var id in this.post('oneclick')){
						productId = id;
					}

					this.model('product').where({_id:productId}).findOne(function(product){
						cart.clean().set(product, that.post('oneclick')[product._id]);

						if(!cart.count){
							that.redirect('/cart');
							return;
						}

						for(var key in cart.products){
							order.products.push(cart.products[key]);
						}

						order.productCount = cart.count;
						order.total = cart.total;
						order.setAttributes(that.post());
						order.save(function(){
							cart.clean().save();
							that.cookie('last_order',order._id);
							that.tmpl().display('thanks',{
								title:'Спасибо за покупку!',
								contact: order.skype ? 'skype' : (order.email ? 'email' : 'phone'),
								order:order
							});
						});
					});

					return;
				}

				if(!cart.count){
					that.redirect('/cart');
					return;
				}

				for(var key in cart.products){
					order.products.push(cart.products[key]);
				}

				order.productCount = cart.count;
				order.total = cart.total;
				order.setAttributes(this.post());
				order.save(function(){
					cart.clean().save();
					that.cookie('last_order',order._id);
					that.tmpl().display('thanks',{
						title:'Спасибо за покупку!',
						contact: order.skype ? 'skype' : (order.email ? 'email' : 'phone'),
						order:order
					});
				});
			}else{

				cart.title = 'Оформление заказа';

				if(this.get('product')){
					var product = this.model('product').where({_id:this.get('product')}).findOne(function(product){
						cart.clean().set(product,that.get('count',1));
						if(!cart.count){
							that.redirect('/cart');
							return;
						}

						cart.title = 'Покупка "'+product.title+'"';
						cart.oneclick = true;

						if(that.cookie('last_order')){
							order.where({_id:that.cookie('last_order')}).findOne(function(order){
								cart.lastOrder = order;
								that.tmpl().display('checkout',cart);
							});
						}else{
							that.tmpl().display('checkout',cart);
						}

					});
				}else{
					if(!cart.count){
						that.redirect('/cart');
						return;
					}
					if(that.cookie('last_order')){
						order.where({_id:that.cookie('last_order')}).findOne(function(order){
							cart.lastOrder = order;
							that.tmpl().display('checkout',cart);
						});
					}else{
						that.tmpl().display('checkout',cart);
					}
				}
			}
		}
	}

	this.clean = function(){
		this.model('cart',this).clean().save();
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