var Categories = function(){
	var $c = this;

	this.index = function(){
		this.model('category').where({_id:this.get('id')}).findOne(function(category){
			if(category._id){
				
				$c.model('category').where({parent:category._id}).find(function(subcategories){

					var where = {};

					if(subcategories.length){

						var cats = [];

						subcategories.forEach(function(subcat){
							cats.push(subcat._id);
						});

						where = {category:{$in:cats}}
					}else{
						where = {category:category._id};
					}

					$c.model('product').where(where).find(function(products){
						$c.tmpl().display('category',{
							title:category.title,
							category:category,
							products:products,
							categories:subcategories
						});
					});
				});
				
				
			}
		});
	}

}

module.exports = Categories;