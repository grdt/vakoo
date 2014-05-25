var Categories = function(){
	var $c = this;

	this.index = function(){
		this.model('category').where({_id:this.get('id')}).findOne(function(category){
			if(category._id){

				var subs;

				var data = {
					title:category.title,
					category:category,
				};

				$c.model('category').where({parent:category._id}).find(function(subcategories){

					var where = {};

					if(subcategories.length){

						var cats = [];

						subcategories.forEach(function(subcat){
							cats.push(subcat._id);
						});

						subs = subcategories;

						where = {category:{$in:cats}}
					}else{
						where = {category:category._id};
						$c.model('category').where({parent:category.parent}).find(function(subcategories){
							subs = subcategories;
							subs.forEach(function(sub){
								if(sub._id == category._id){
									sub.active = true;
								}
							});
						});
					}

					$c.model('product').where(where).count(function(count){

						data.productCount = count;

						if($c.config.product.perPage < count){
							$c.model('product').where(where).limit($c.get('p') * $c.config.product.perPage,$c.config.product.perPage).find(function(products){
								data.products = products;
								data.categories = subs;
								data.pagination = {page:$c.get('p')*1 + 1,count:count,perPage:$c.config.product.perPage};
								$c.tmpl().display('category',data);
							});
						}else{
							$c.model('product').where(where).find(function(products){
								data.categories = subs;
								data.products = products;
								$c.tmpl().display('category',data);
							});
						}
					});
				});
				
				
			}
		});
	}

}

module.exports = Categories;