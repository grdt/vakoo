var Menu = function(){

	this.render = function(factory,data){
		var model = factory.option('shop').model('category');
		var tree = [];
		var result = false;
		var categories = data['catalog:menu'].categories;
		categories.sort(function(a,b){
			return a.ancestors.length - b.ancestors.length;
		});

		categories.forEach(function(category){

			var parent;

			if(category.selected){
				console.log(category._id);
			}

			if(category.ancestors.length == 0){
				tree[category._id] = category.clean();
				tree[category._id].selected = category.selected;
				tree[category._id].path = category.url();
			}else{
				parent = tree[category.ancestors[0]];
				if(category.ancestors.length > 1){
					for(key in category.ancestors){
						if(parent && typeof parent.childs[category.ancestors[key]] != "undefined"){
							parent = (parent) ? parent.childs[category.ancestors[key]] : false;
						}
					}
					if(parent){
						if(!parent.childs){
							parent.childs = [];
						}
						parent.childs[category._id] = category.clean();
						parent.childs[category._id].selected = category.selected;
						parent.childs[category._id].path = category.url();
						parent.childs[category._id].childs = false;
					}else{
						tree[category._id] = category.clean();
						tree[category._id].selected = category.selected;
						tree[category._id].path = category.url();
					}
				}else{
					if(parent){
						if(!parent.childs){
							parent.childs = [];
						}
						parent.childs[category._id] = category.clean();
						parent.childs[category._id].selected = category.selected;
						parent.childs[category._id].path = category.url();
					}else{
						tree[category._id] = category.clean();
						tree[category._id].selected = category.selected;
						tree[category._id].path = category.url();
					}
				}
			}
		});
		
		var open = '';

		if(factory.from.query.request.url == '/'){
			open = 'open';
		}

		return {view:'modules.catalog-menu',data:{tree:tree,open:open}};

	}
}

module.exports = Menu;