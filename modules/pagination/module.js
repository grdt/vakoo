var url = require('url');

var Pagination = function(){

	this.foo = 'bar';

	this.render = function(factory,data,options){
		var pages = Math.ceil(options.count / options.perPage);
		var pagesArr = [];
		
		var parsedUrl = url.parse(factory.from.url.request.url);

		for(var i=1;i<=pages;i++){
			pagesArr.push({
				page:i,
				url:parsedUrl.pathname + (((i-1) == 0) ? '' : '?p=' + (i-1)),
				active:(options.page == i)});
		}


		var prev = {
			url:parsedUrl.pathname + (((options.page - 2) == 0) ? '' : '?p=' + (options.page - 2)),
			enable:false
		};

		if(options.page > 1){
			prev.enable = true;
		}

		var next = {
			url:parsedUrl.pathname + '?p=' + options.page,
			enable:false
		};

		if(options.page != pages){
			next.enable = true;
		}

		return {view:'modules.pagination',data:{pagesArr:pagesArr,prev:prev,next:next}};
	}
}

module.exports = Pagination;