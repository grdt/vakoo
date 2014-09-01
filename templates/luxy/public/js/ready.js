var updateCart = function(cart){
	$(".cart-btn .btn span").html(cart.count);
	$(".cart-dropdown .total .t").html(numberFormat(cart.total));
	var $table = $(".cart-dropdown .body table").empty();

	$(cart.products).each(function(i,product){
		var $tr = $('<tr></tr>',{
			"class":"item"
		});

		$tr.append(
			'<td>' +
				'<div class="delete" data-id="'+product._id+'"></div>' +
				'<a href="'+product.url+'">'+product.title+'</a>' +
			'</td>'
		);

		$tr.append(
			'<td><input type="text" value="'+product.count+'" data-id="'+product._id+'"></td>'
		);

		$tr.append(
			'<td class="price">'+numberFormat(product.total)+' <span class="fa fa-rouble"></span></td>'
		);

		$table.append($tr);

	});

}

$(document).ready(function(){
	$(".quick-contact").submit(function(){

		var $form = $(this);

		$.post('/?option=main&task=feedback',$form.serialize(),function(response){
			if(response.success){
				$form.find('[name]').each(function(){
					$(this).val('');
				});

				$form.find('.success-message').show();
				$form.find('.form').hide();

				setTimeout(function(){
					$form.removeClass('visible');
					$("#qcf-btn").removeClass('active');

					$form.find('.success-message').hide();
					$form.find('.form').show();
				},3000);
			}
		});

		return false;
	});

	$(".subscr-form").submit(function(){

		var $form = $(this);

		$.post('/?option=main&task=feedback',$form.serialize(),function(response){
			if(response.success){
				$form.hide().next().hide();
				$form.prev().html('Вы успешно подписались! Ждите новостей ;)');
			}
		});

		return false;
	});

	$.post('/shop/cart/data').success(function(cart){

		updateCart(cart);

	});

	$(".add-cart-btn").click(function(){
		var $button = $(this),
			value = '+1';

		if($button.data('value-selector')){
			value = '+' + $($button.data('value-selector')).val()*1;
		}

		$.post('/shop/cart/add',{id:$button.data('id'),value:value})
			.success(function(cart){

				updateCart(cart);

			});
		return false;
	});
});