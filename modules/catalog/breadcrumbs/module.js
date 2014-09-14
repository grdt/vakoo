var Breadcrumbs = function(){
	this.render = function(factory,input){

		var data = input['catalog:breadcrumbs'];

		if(factory.from.query.request.url == '/')
			return false;

		var crumbs = [
			{
				url:'/',
				title:'Главная'
			}
		];

		var item;

		if(factory.from.query.executor.option == 'shop'){



			if(factory.from.query.executor.controller == 'categories'){
				item = 'category';
			}

			if(factory.from.query.executor.controller == 'products'){
				item = 'product';
			}

			if(item && factory.from.query.executor.method == 'index'){
				var ancestors = factory._data[item].ancestors;
				var categories = data.categories;

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
					url:factory._data[item].url(),
					title:factory._data[item].title
				});

			}
		}

		if(!item){
			crumbs.push({url:'.',title:factory.title(true)});
		}

		return {view:'modules.catalog-breadcrumbs',data:{crumbs:crumbs,history:factory._data.history}};
	}
}


module.exports = Breadcrumbs;