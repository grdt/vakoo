$(document).ready(function(){

});

$(document).on('click','.add-to-cart',function(){
	var $button = $(this);
	$.post('/shop/cart/add',{id:$button.data('id'),value:'+1'})
		.success(function(cart){

			if($button.hasClass('one-click')){
				alert('load modal');
			}else{
				$button.popover({
					animation:true,
					html:true,
					placement:'top',
					content:'<strong><span class="glyphicon glyphicon-shopping-cart"></span> Добавлено</strong>',
					selector:$button
				}).popover('show');

				setTimeout(function(){
					$button.popover('destroy');
				},1000);
			}

			window.cart.update(cart);

		});
	return false;
});

var Cart = function(){
	var self = this;
	this.update = function(options){
		if(typeof options == "undefined"){
			$.post('/shop/cart/get').success(function(cart){
				self.update(cart);
			});
		}else{
			$(".cart .total").html(options.total);
			$(".cart .count").html(options.count);
		}
	}
};

var cart = new Cart;
cart.update();