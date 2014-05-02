var Menu = function(){

	this.render = function(factory,data){
		var model = factory.option('shop').model('category');
		var tree = [];
		var result = false;
		var categories = data.categories;
		categories.sort(function(a,b){
			return a.ancestors.length - b.ancestors.length;
		})

		categories.forEach(function(category){

			var parent;

			if(category.ancestors.length == 0){
				tree[category._id] = category.clean();
				tree[category._id].path = category.ancestors.join('/').replace('svet','') + '/' + category._id;
				tree[category._id].childs = [];
			}else{
				parent = tree[category.ancestors[0]];
				if(category.ancestors.length > 1){
					for(key in category.ancestors){
						if(typeof parent.childs[category.ancestors[key]] != "undefined"){
							parent = parent.childs[category.ancestors[key]];
						}
					}
					if(parent){
						parent.childs[category._id] = category.clean();
						parent.childs[category._id].path = category.ancestors.join('/').replace('svet','') + '/' + category._id;
						parent.childs[category._id].childs = [];

					}
				}else{
					parent.childs[category._id] = category.clean();
					parent.childs[category._id].path = category.ancestors.join('/').replace('svet','') + '/' + category._id;
					parent.childs[category._id].childs = [];
				}
			}
		});

		return {view:'modules.catalog-menu',data:{tree:tree.svet}};

	}
}

module.exports = Menu;