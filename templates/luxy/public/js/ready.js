var updateCart = function(cart){
	if(!cart.count){
		return;
	}

	$(".cart-btn").removeClass('empty');
	$(".cart-btn .btn span").html(cart.count);
	$(".cart-dropdown .total .t").html(numberFormat(cart.total));
	var $table = $(".cart-dropdown .body table").empty(),
		$shoppingCart = $(".shopping-cart");

	$table.append(
		'<tr>' +
			'<th>Наименование</th>' +
			'<th>Кол-во</th>' +
			'<th>Стоимость</th>' +
		'</tr>'
	);

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

		if($shoppingCart.length){
			var $item = $shoppingCart.find('.items-list .item[data-id='+product._id+']');
			$item.find('.quantity').val(product.count);
			$item.find('.total').html(
				numberFormat(product.total)+' <span class="fa fa-rouble"></span>'
			);
		}

	});

	if($shoppingCart.length){

		$shoppingCart.find('.cart-sidebar .total').html(
			numberFormat(cart.total)+' <span class="fa fa-rouble"></span>'
		);

		$shoppingCart.find('.cart-sidebar .order-total').html(
			numberFormat(cart.orderTotal)+' <span class="fa fa-rouble"></span>'
		);

		$shoppingCart.find('.cart-sidebar .delivery').html(
			cart.delivery + ((cart.delivery > 0) ? ' <span class="fa fa-rouble"></span>' : '')
		);


		if(!cart.products.length){
			$shoppingCart.find('.title').html('Корзина пуста!');
			$shoppingCart.find('.cart-sidebar').hide();
			$shoppingCart.find('.items-list').hide();
			$shoppingCart.find('h3').hide();
		}

	}

};

var goToDescr = function(){
	var $tabs = $('.tabs-widget');
	$('html, body').animate({
		scrollTop: $tabs.offset().top - 100
	}, 300);
	$("a[href=#descr]").click();
}

$(document).ready(function(){

	if($(".available-form").size()){


		$("#available-input").on('keyup',function(){
			var $this = $(this),
				value = $this.val(),
				emailReg = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
				phoneReg = /^\D?(\d{3})\D?\D?(\d{3})\D?(\d{2})\D?(\d{2})/,
				phonePattern = "($1) $2-$3-$4",
				digits = value.replace(/[А-Яа-яA-Za-z$-]/g, ""),
				skypeReg = /[a-zA-Z][a-zA-Z0-9\.,\-_]{5,31}/,
				$formGroup = $(this).closest(".form-group")
				runSkype = true;

			$(".available-form .form-control-feedback").addClass("hide");
			$formGroup.removeClass("has-success").removeClass("has-error");

			if(value.length >= 5){
				if(emailReg.test(value)){
					$(".available-form .form-control-feedback.fa-envelope").removeClass("hide");
					$formGroup.addClass("has-success");
					return;
				}else{
					if(digits.length >= 8){
						var phone = '';
						if(digits[0] == 8){
							phone = '+7 ' + digits.substring(1).replace(phoneReg,phonePattern);
						}else if(digits[0] == '+' && digits[1] == 7){
							phone = '+7 ' + digits.substring(2).replace(phoneReg,phonePattern);
						}else{
							phone = '+7 ' + digits.substring(0).replace(phoneReg,phonePattern);
						}

						if(phone.length >= 18){
							$(".available-form .form-control-feedback.fa-phone").removeClass("hide");
							$formGroup.addClass("has-success");
							return;
						}
					}else{
						if(skypeReg.test(value)){
							$(".available-form .form-control-feedback.fa-skype").removeClass("hide");
							$formGroup.addClass("has-success");
							return;
						}
					}
				}
			}

			$formGroup.addClass("has-error");
			$(".available-form .form-control-feedback.fa-times").removeClass("hide");

		}).on('blur',function(){
//			$(".available-form .form-control-feedback").addClass("hide");
//			$(this).closest(".form-group").removeClass("has-success").removeClass("has-error");
		});

		$(".available-form").submit(function(){

			if(!$(".available-form .form-group").hasClass("has-success"))
				return false;

			var contact = $(".available-form").find("#available-input").val();
			var productId = $(".available-form").find("#available-input").data("product-id");


			$.post('/?option=main&task=feedback',{contact:contact,name:"Manager",message:"Пользователь просит подписаться на появление товара <strong>"+productId+"</strong> в наличии."},function(response){

				$(".available-form").html("<p>Спасибо что оставили свой контакт! Мы обязательно сообщим вам о том когда товар будет доступен для заказа!</p>");

				setTimeout(function(){
					$("#availableModal").modal("hide");
				},3000)
			});

			return false;
		});
	}

	$(".popover-me.top.hover").popover({
		placement: 'top',
		trigger: 'hover'
	});

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

				$button.popover({
					content:'Товар добавлен в корзину',
					placement: 'top',
					container: 'body'
				}).popover('show');

				setTimeout(function(){
					$button.popover('destroy');
				},1000);

			});
		return false;
	});

	if($(".category-desc").size()){
		$("h1").css({cursor:'help'}).hover(function(){
			$(".category-desc").hide().removeClass('hide').show('fast');
		},function(){
			$(".category-desc").hide('fast');
		});
	}

	var ysInterval = setInterval(function(){
		if(!$(".ya-site-form__input-text").size()){
			return;
		}
		clearInterval(ysInterval);

		$(".ya-site-form__input").css({marginTop:50});

		var $btn = $('<button type="submit" style="color:#fff;font-size: 27px!important;"></button>').append('<i class="icon-magnifier" style="font-size: 27px!important;"></i>');

		$btn.click(function(){
			$(".ya-site-form__submit").click();
			return false;
		});
		$(".ya-site-form__search-input-layout-r").css({marginTop:50,position:'absolute'}).append($btn);
	},300);

	if(Page.cookie('city') == 'choose'){
		chooseCity();
	}

	$("#cityModal").on('hide.bs.modal',function(){
		Page.cookie('city',Page.getSubdomain());
	});

	$("#cityModal").find('#city-input').on('keyup',function(e){
		var $menu = $("#cities-list").find('.dropdown-menu');

		switch(e.keyCode){
			case 13:
				//enter
				if($menu.find('li>a').length == 1){
					$menu.find('li>a').click();
				}else{
					$menu.find('li.active>a').click();
				}
				return;
			break;
			case 40:
				if($menu.find('li.active').length){
					$menu.find('li.active').removeClass('active').next().addClass('active');
				}else{
					$menu.find('li').first().addClass('active');
				}
				return;
			break;
			case 38:
				if($menu.find('li.active').length){
					$menu.find('li.active').removeClass('active').prev().addClass('active');
				}else{
					$menu.find('li').last().addClass('active');
				}
				return;
			break;

		}

		$("#cities-list").removeClass('open');

		if($(this).val().length >= 3){
			$.get('/?option=shop&task=cities.search&term=' + $(this).val(),function(response){
				$("#cities-list").addClass('open');
				$menu.empty();
				if(response.length){
					$(response).each(function(i,city){
						if(city.region){
							city.region = '(' + city.region + ')';
						}
						$menu.append(
							$('<li><a href="#" onclick="setCity(\''+city.alias+'\')">'+city.title+' <small>'+city.region+'</small></a></li>')
						);
					});
				}else{
					$menu.append(
						$('<li><a href="#" onclick="$(\'#cityModal\').modal(\'hide\')">Ничего не найдено</a></li>')
					);
				}

			});
		}
	});
});

var setCity = function(alias){
	if(Page.getSubdomain() != alias){
		Page.cookie('city',alias);
		window.location.reload();
	}

}

var chooseCity = function(data){
	var aliases = [],
		cb = function(link){
			$.get(link,function(response){
				$("#cityModal").modal();

				$("#cityModal").find('form').submit(function(){
					$("#cityModal").modal('hide');
					return false;
				});

				if(response.city){
					$("#cityModal").find('.city-finded').removeClass('hide').find('.city-valid').html(response.city.title + (response.city.region ? (' ( '+response.city.region+' )') : '')).click(function(){
						setCity(response.city.alias);
					});
				}

				if(response.cities){
					var $list = $("#cityModal").find(".cities-finded").removeClass('hide').find('.city-valid-list');
					for(var key in response.cities){
						var city = response.cities[key];
						var $a = $('<a></a>',{href:'#'}).data('city',city.alias).html(city.titles.from + (city.region ? (' ( '+city.region+' )') : '')).click(function(){
							setCity($(this).data('city'));
						});
						$list.append($a).append('   ');
					}
				}
			},'json');
		};

	if(typeof data != "undefined"){
		for(var alias in data){
			aliases.push(alias);
		}
	}else{
		aliases = [Page.getSubdomain()];

		var link = '/?option=shop&task=cities.choose&aliases[]=' + aliases.join('&aliases[]=');

		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(pos){
				var lat = pos.coords.latitude;
				var lng = pos.coords.longitude;
                console.log("current pos", lat, lng);

				link += '&lat='+lat+'&lng='+lng;

				cb(link);

			},function(){
				cb(link);
			});
		}else{
			cb(link);
		}
	}
}