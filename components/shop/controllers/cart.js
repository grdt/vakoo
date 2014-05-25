var Controller = function(){

	var $c = this;

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

	this.get = function(){
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