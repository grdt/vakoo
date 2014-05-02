var Categories = function(){
	var $c = this;

	this.index = function(){
		this.model('category').where({_id:this.get('id')}).findOne(function(category){
			if(category._id){
				$c.model('product').where({category:category._id}).find(function(products){
					$c.tmpl().display('category',{
						title:category.title,
						category:category,
						products:products
					});
				});
			}
		});
	}

}

module.exports = Categories;