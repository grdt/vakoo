var Categories = function(){
	var $c = this;

	this.index = function(){
		if(this.get('id')){
			this.model('product').where({_id:this.get('id')}).findOne(function(product){
				$c.tmpl().display('product',{product:product});
			});
		}
	}

}

module.exports = Categories;