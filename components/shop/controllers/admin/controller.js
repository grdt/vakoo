/**
 * @constructor
 * @extends CoreAdminController
 */
var ShopIndexAdminController = function(){

	var that = this;

	this.categories = function(){
		this.where();
	}
}


module.exports = ShopIndexAdminController;