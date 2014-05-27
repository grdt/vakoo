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
			
			if(factory.from.url.executor.controller == 'categories'){
				if(factory.from.url.executor.method == 'index'){
					var ancestors = data.category.ancestors;
					var categories = data['catalog:menu'].categories;		
					ancestors.forEach(function(ancestor){
						categories.forEach(function(category){
							if(category._id == ancestor && ancestor != 'svet'){
								crumbs.push({
									url: '/' + category.ancestors.join('/'),
									title: category.title
								});
							}	
						});
					});

//					crumbs.push({
//						url: '/' + data.category.ancestors.join('/'),
//						title: data.category.title
//					});
					
				}
			}
		}

		return {view:'modules.catalog-breadcrumbs',data:{crumbs:crumbs,backs:data.history}};
	}
}


module.exports = Breadcrumbs;