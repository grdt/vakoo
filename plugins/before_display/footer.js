var Plugin = function(){
	var $p = this;

	this.callback = false;

	this.init = function(){
		var aliases = {};
		var $l = arguments[0][0];
		var loader = this.load;
		var vakoo = this;
		var next = arguments[1];
		var pages;

		if(pages = vakoo.memory('all-articles')){
			pages.forEach(function(page){
				aliases[page.alias] = page;
			});

			$l._data['footer'] = aliases;

			if(typeof next == "function"){
				next();
			}
		}else{
			loader.option('content').model('page').where({type:'article'}).find(function(pages){

				vakoo.memory('all-articles',pages);

				pages.forEach(function(page){
					aliases[page.alias] = page;
				});

				$l._data['footer'] = aliases;

				if(typeof next == "function"){
					next();
				}
			});
		}
	}
}

module.exports = Plugin;