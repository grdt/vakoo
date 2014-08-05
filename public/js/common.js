$(document).ready(function(){
	dateFormating();
});

$(window).load(function(){

});

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

var Modal = function(name,url){

	for(key in openModals){
		if(openModals[key].$modal){
			openModals[key].$modal.modal('hide');
		}
	}

	var self = this;

	openModals[name] = this;

	this.name = name;

	this.$modal = null;

	if(typeof url != "undefined" && typeof url != "object"){

		$.get(url).success(function(html){
			if($('#modal-'+name).length){
				$('#modal-'+name).replaceWith(html);
			}else{
				$('body').append(html);
			}

			self.$modal = $('#modal-'+name);

			self.$modal.modal();

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
			$(params.buttons).each(function(i,button){
				var $button = $('<input/>',{
					type:'button',
					"class":'btn ' + ((button.class) ? button.class : ''),
				});

				for(key in button){
					if(key != 'class'){
						$button.attr(key,button[key]);
					}
				}

				if(button.html){
					$button.val(button.html);
				}else{
					$button.val('Сохранить');
				}

				self.$modal.find('.modal-footer').empty().append($button);

			});
		}

	}

	this.confirm = function(message){
		$('#modal-confirm').find('.modal-body').html(message);
		$('#modal-confirm').modal();
	}

	this.initCart = function(){
		this.$modal.on('click',function(e){
			
			
			if($(e.target).hasClass('save-count')){

			}

			if($(e.target).data('action')){
				if($(e.target).data('action') == 'checkout'){
					var modal = new Modal('one-click','/shop/cart/form');
				}
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
					console.log('save');
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


var dateFormating = function(){
	moment.lang('ru');
	const JUST_NOW_TIMEOUT = 5 * 60 * 1000;
	$(".date").each(function(){
		var date = new Date($(this).html());

		switch($(this).data('moment')){
			case 'calendar':
				$(this).html(moment(date).calendar());
				break;
			case "no":
				break;
			case 'fromnow':
				if(((new Date).getTime() - date.getTime()) <= JUST_NOW_TIMEOUT){
					$(this).html('только что');
				}else{
					$(this).html(moment(date).fromNow());
				}
				break;
			default:
				if(moment(date).format('L') == moment().format('L')){
					//today
					$(this).html('сегодня в ' + moment(date).format('HH:mm'));
				}else{
					$(this).html(moment(date).format('LLLL'));
				}
				break;
		}
	});
}

var numberFormat = function(number, decimals, dec_point, thousands_sep){
	var i, j, kw, kd, km;
	if( isNaN(decimals = Math.abs(decimals)) ){
		decimals = 0;
	}
	if( dec_point == undefined ){
		dec_point = ".";
	}
	if( thousands_sep == undefined ){
		thousands_sep = " ";
	}

	i = parseInt(number = (+number || 0).toFixed(decimals)) + "";

	if( (j = i.length) > 3 ){
		j = j % 3;
	} else{
		j = 0;
	}

	km = (j ? i.substr(0, j) + thousands_sep : "");
	kw = i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands_sep);
	//kd = (decimals ? dec_point + Math.abs(number - i).toFixed(decimals).slice(2) : "");
	kd = (decimals ? dec_point + Math.abs(number - i).toFixed(decimals).replace(/-/, 0).slice(2) : "");

	return km + kw + kd;
}