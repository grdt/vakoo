var Breadcrumbs = function(){
	this.render = function(factory,data){

		if(factory.from.url.request.url == '/')
			return false;

		var crumbs = [
			{
				url:'/',
				title:'Главная'
			}
		];

		if(factory.from.url.executor.option == 'shop'){

			var item;

			if(factory.from.url.executor.controller == 'categories'){
				item = 'category';
			}

			if(factory.from.url.executor.controller == 'products'){
				item = 'product';
			}

			if(factory.from.url.executor.method == 'index'){
				var ancestors = data[item].ancestors;
				var categories = data['catalog:menu'].categories;

				ancestors.forEach(function(ancestor){
					categories.forEach(function(category){
						if(category._id == ancestor){
							crumbs.push({
								url: category.url(),
								title: category.title
							});
						}
					});
				});

				crumbs.push({
					url:data[item].url(),
					title:data[item].title
				});

			}
		}

		return {view:'modules.catalog-breadcrumbs',data:{crumbs:crumbs,backs:data.history}};
	}
}


module.exports = Breadcrumbs;