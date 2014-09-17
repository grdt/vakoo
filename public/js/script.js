var openModals = {};

$(document).on('click','.add-to-cart',function(){
	var $button = $(this);
	$.post('/shop/cart/add',{id:$button.data('id'),value:($button.data('value') || $button.data('value') == '0') ? $button.data('value') : '+1'})
		.success(function(cart){

			if($button.hasClass('one-click')){
				var modal = new Modal('one-click','/shop/cart/form?id='+$button.data('id'));
			}else{

				if(!$button.hasClass('no-popover')){
					$button.popover({
						animation:true,
						html:true,
						placement:'top',
						content:'<strong><span class="glyphicon glyphicon-shopping-cart"></span> Добавлено</strong>',
						selector:$button,
						container:'body'
					}).popover('show');

					setTimeout(function(){
						$button.popover('destroy');
					},1000);
				}
			}

			window.cart.update(cart);

		});
	return false;
});


$(document).on('submit',"#feedback-form",function(){
	var $form = $(this),
		data = $form.serializeArray(),
		success = true;

	$(data).each(function(i,item){
		if(!item.value || item.value.length < 3){
			$form.find('[name=' + item.name + ']')
				.closest('.form-group')
				.addClass('has-error')
				.addClass('has-feedback')
				.append('<span class="glyphicon glyphicon-remove form-control-feedback"></span>');
			
			success = false;
		}
	});

	
	if(success){
		$.post('/?option=main&task=feedback',$form.serialize(),function(response){
			if(response.success){
				var modal = new Modal('dialog',{
					title:'Сообщение отправлено!',
					body:'Наш менеджер уже получил сообщение и свяжется с вами в ближайшие минуты. Спасибо за ваше внимание!',
					buttons:[
						{
							"data-dismiss":'modal',
							"class":"btn-primary",
							"html":'Закрыть'
						}
					]
				});

				$form.find('[name]').each(function(){
					$(this).val('')
						.closest('.form-group')
						.removeClass('has-error')
						.removeClass('has-success')
						.removeClass('has-feedback');

					$(this).closest('.form-group').find('.glyphicon').remove();
				});
			}
		});
	}
	
	return false;
});

$(document).on('blur','#feedback-form input, #feedback-form textarea',function(){

	if($(this).val().length > 3){
		$(this).closest('.form-group')
			.addClass('has-success')
			.addClass('has-feedback')
			.append('<span class="glyphicon glyphicon-ok form-control-feedback"></span>');
	}

});

$(document).on('focus','#feedback-form input, #feedback-form textarea',function(){
	$(this).closest('.form-group')
		.removeClass('has-error')
		.removeClass('has-success')
		.removeClass('has-feedback');

	$(this).closest('.form-group').find('.glyphicon').remove();
});

$(document).on('click','.cart>a',function(){
	var modal = new Modal('cart','/shop/cart');
	return false;
});

var Cart = function(){
	var self = this;
	this.update = function(options){
		if(typeof options == "undefined"){
			$.post('/shop/cart/data').success(function(cart){
				self.update(cart);
			});
		}else{
			$(".cart .total").html(numberFormat(options.total));
			$(".cart .count").html(options.count);
			if(typeof openModals.cart != "undefined" && options.item){
				openModals.cart.listUpdate(options);
			}
		}
	}
};

var Modal = function(name,url,settings){

	for(key in openModals){
		if(openModals[key].$modal){
			openModals[key].$modal.modal('hide');
		}
	}

	var self = this;

	var that = this;

	openModals[name] = this;

	this.name = name;

	this.$modal = null;

	this.onShow = function(){};//show.bs.modal

	this.onLoad = function(){};//shown.bs.modal

	this.onClose = function(){};//hide.bs.modal

	this.onHide = function(){};//hidden.bs.modal

	this.hidden = true;

	if(typeof settings != "undefined"){
		for(var key in settings){
			if(typeof this[key] != "undefined"){
				this[key] = settings[key];
			}
		}
	}

	if(typeof url != "undefined" && typeof url != "object"){

		if(!$('#modal-'+name).length){
			this.$modal = $('<div class="modal fade" id="modal-'+name+'"></div>');
		}else{
			this.$modal = $('#modal-'+name);
		}

		this.$modal.off('show.bs.modal').on('show.bs.modal',this.onShow);
		this.$modal.off('shown.bs.modal').on('shown.bs.modal',this.onLoad);
		this.$modal.off('hide.bs.modal').on('hide.bs.modal',this.onClose);
		this.$modal.on('hide.bs.modal',function(){
			that.hidden = true;
		});
		this.$modal.off('hidden.bs.modal').on('hidden.bs.modal',this.onHide);
		this.$modal.on('hidden.bs.modal',function(){
			that.hidden = true;
		});

		$.get(url).success(function(html){
			
//			self.$modal.html($('<div>' + html + '</div>').html());
			self.$modal.html(html);

			self.$modal.modal();

			that.hidden = false;

			if(self.name == 'cart'){
				self.initCart();
			}

			if(self.name == 'one-click'){
				self.$modal.find('form').submit(function(){
					$.post('/shop/cart/checkout',$(this).serializeArray(),function(response){
						var modal = new Modal('dialog',{
							title:'Ваш заказ принят!',
							body:'Наш менеджер свяжется с Вами в ближашее время!',
							buttons:[
								{
									"data-dismiss":'modal',
									"class":"btn-primary",
									"html":'Спасибо!'
								}
							]
						});
						cart.update();
					});
					return false;
				});
			}
		});
	}

	if(name == 'dialog' && typeof url == "object"){

		cart.update();

		this.$modal = $("#modal-dialog");
		this.$modal.modal();

		var params = url;

		if(params.title){
			this.$modal.find('.modal-header>h4').html(params.title);
		}

		if(params.body){
			this.$modal.find('.modal-body').html('<p>' + params.body + '</p>');
		}

		if(params.buttons){

			self.$modal.find('.modal-footer').empty();

			$(params.buttons).each(function(i,button){
				var $button = $('<input/>',{
					type:'button',
					"class":'btn ' + ((button.class) ? button.class : ''),
				});
				
				if(button.onClick){
					$button.on('click', button.onClick);
				}

				for(key in button){
					if(key != 'class' && key != 'onClick'){
						$button.attr(key,button[key]);
					}
				}

				if(button.html){
					$button.val(button.html);
				}else{
					$button.val('Сохранить');
				}

				self.$modal.find('.modal-footer').append($button);

			});
		}

	}

	this.confirm = function(message){
		$('#modal-confirm').find('.modal-body').html(message);
		$('#modal-confirm').modal();
	}

	this.initCart = function(){
		this.$modal.off('click').on('click',function(e){


			if($(e.target).hasClass('save-count')){

			}

			if($(e.target).data('action')){
				if($(e.target).data('action') == 'checkout'){
					var modal = new Modal('one-click','/shop/cart/form');
				}

				if($(e.target).data('action') == 'clean'){
					var modal = new Modal('dialog',{
						title:'Очистка корзины!',
						body:'Вы уверены что хотите очистить корзину? Это действие необратимо!',
						buttons:[
							{
								"data-dismiss":'modal',
								"class":"btn-danger",
								"html":'Да, я уверен!',
								"onClick":function(){
									$.get('/shop/cart/clean',function(){
										cart.update();
									});
								}
							},
							{
								"data-dismiss":'modal',
								"class":"btn-primary",
								"html":'Нет'
							}
						]
					});
				}
			}

			if($(e.target).data('dismiss') == 'modal'){
				$(e.target).closest('.modal').modal('hide');
			}

			if(!$(e.target).hasClass('form-control')){
				self.$modal.find('.popover').remove();
			}

			if($(e.target).hasClass('count-button') || $(e.target).closest('.count-button').length){
				var $button = $(e.target);
				var $input = $('<input/>',{
					type:'text',
					style:'display:inline-block;width:50px;',
					"class":'form-control'
				}).val($button.parent().find('.count').html());

				var $content = $('<div/>',{
					"class":'input-group',
					style:'width:90px'
				});

				var $okButton = $('<button/>',{
					"class":'btn btn-primary save-count add-to-cart',
					"data-value":$input.val(),
					"data-id":$button.closest('tr').data('product-row')
				}).html('<span class="glyphicon glyphicon-ok"></span>');


				$input.keydown(function(e){
					if(e.keyCode == 13){
						$input.closest('.input-group').find('.add-to-cart').eq(0).click();
					}

					$input.parent().find('.add-to-cart').data('value',$input.val())
				});

				$input.keyup(function(){
					$input.closest('.input-group').find('.add-to-cart').eq(0).attr('data-value',$input.val())
				});

				$okButton.click(function(){
					self.$modal.find('.popover').remove();
				});

				$content.append($input).append('<span class="input-group-btn">' + $('<div>').append($okButton).html() + '</span>');

				$button.popover('destroy').popover({
					animation:true,
					html:true,
					placement:'top',
					content:$content,
					selector:$button,
					container:$button.closest('tr')
				}).popover('show');

				$input.focus().select();
			}
		});
	}

	this.listUpdate = function(options){
		var $tr = this.$modal.find('[data-product-row='+options.item._id+']');
		if(options.item.count != 0){
			$tr.find('.total').html(numberFormat(options.item.total));
			$tr.find('.count').html(options.item.count);
		}else{
			$tr.remove();
		}
		this.$modal.find('.total-price').html(numberFormat(options.total));
	}
}

var cart = new Cart;
cart.update();

//cities

var storage = new Storage('vakoo');





var setCity = function(alias){
	$("#modal-city").modal('hide');
	setCookie('city',alias);
	if(getSubdomain() != alias){
		window.location = window.location.href.replace(getSubdomain(),alias);
	}
}

var closeCity = function(){
	setTimeout(function(){
		if(openModals['city'] && !openModals['city'].hidden){
			$("#modal-city").modal('hide');
		}
	},500);

	delete openModals['city'];

	setCookie('city',getSubdomain());
}

var chooseCity = function(data){
	var aliases = [];
	if(typeof data != "undefined"){
		for(var alias in data){
			aliases.push(alias);
		}	
	}else{
		aliases = [getSubdomain()];
	}
	var modal = new Modal('city','/?option=shop&task=cities.choose&aliases[]=' + aliases.join('&aliases[]='), {
		onLoad:function(){
			modal.$modal.find('#choose-city-input').on('keyup',function(e){

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
								$('<li><a href="#" onclick="closeCity()">Ничего не найдено</a></li>')
							);
						}

					});
				}	
			});
		},
		onClose:function(){
			closeCity();
		}
	});

}


