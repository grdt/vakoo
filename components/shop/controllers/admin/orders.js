/**
 * @extends CoreController
 * @constructor
 */
var ShopOrdersAdminController = function(){

	var that = this;

	this.VIEW_NAMESPACE = 'order';

	const ORDER = 'order';

	const PER_PAGE = 50;

	this.count = function(){
		var status = this.get('status'),
			where = (status) ? {status:status} : {};

		this.model('order').where(where).count(function(count){
			that.json({count:count});
		});
	}

	this.index = function(){

		var status = this.get('status'),
			where = (status) ? {status:status} : {},
			data = {};

		this.module('pagination').get(this.model('order').where(where).order({date:-1}),PER_PAGE,that.get('p',0),function(orders, pagination){
			data.pagination = pagination;
			data.orders = orders;
			data.model = that.model('order')
			that.display('list',data);
		});

	}

	this.changeStatus = function(){
		this.model(ORDER).where({_id:this.get('id')}).findOne(function(order){
			if(order._id){
				order.status = that.get('status');
				order.save(function(){
					that.back();
				});
			}
		})
	}

	this.item = function(){
		this.createReturnUrl();
		this.model(ORDER).where({_id:this.get('id')}).findOne(function(order){

			if(that.post()){
				order.setAttributes(that.post()).save();
			}

			if(that.post('exit') == '1'){
				that.back();
			}
			that.display('item',{order:order,products:order.products});
		});
	}



}

module.exports = ShopOrdersAdminController;