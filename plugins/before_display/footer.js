var Plugin = function(){
	var $p = this;

	this.callback = false;

	this.init = function($l,next){

		var aliases = {};

		this.option('content').model('page').where({type:'article'}).find(function(pages){
			pages.forEach(function(page){
				aliases[page.alias] = page;
			});

			$l._data['footer'] = aliases;

			if(typeof next == "function"){
				next($l);
			}
		});

	}
}

module.exports = Plugin;