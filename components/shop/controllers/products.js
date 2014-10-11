var Categories = function(){
	var $c = this;
	var that = this;

	this.index = function(){
		this.query.logTime("product method run");
		if(this.get('id')){
			this.model('product').where({_id:this.get('id')}).findOne(function(product){
				that.query.logTime("product display");
				$c.tmpl().display('product',{product:product,title:product.title, meta:product.meta});
			});
		}
	}

}

module.exports = Categories;