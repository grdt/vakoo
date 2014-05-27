var url = require('url');

var Pagination = function(){

	this.foo = 'bar';

	this.render = function(factory,data,options){
		var pages = Math.ceil(options.count / options.perPage);
		var pagesArr = [];
		
		var parsedUrl = url.parse(factory.from.url.request.url);

		var pagesMax = 10;

		if(pages > pagesMax){

			var from = (options.page - pagesMax/2);
			var to = (options.page + pagesMax/2);
			var addedBefore = 0;
			var addedAfter = 0;

			for(var i=from; i<options.page; i++){
				if(i>0){
					pagesArr.push({
						page:i,
						url:parsedUrl.pathname + (((i-1) == 0) ? '' : '?p=' + (i-1)),
						active:(options.page == i)});
					addedBefore++;
				}
			}

			for(var i=options.page; i<=to; i++){
				if(i<=pages){
					pagesArr.push({
						page:i,
						url:parsedUrl.pathname + (((i-1) == 0) ? '' : '?p=' + (i-1)),
						active:(options.page == i)});
					addedAfter++;
				}
			}

			if(pagesArr != (pagesMax+1)){

			}

			if(from > 1){

				if(from > 2){

					var firstDotes = from - 2;

					pagesArr.unshift({
						page:'...',
						url:parsedUrl.pathname + '?p=' + firstDotes
					});
				}

				pagesArr.unshift({
					page:1,
					url:parsedUrl.pathname
				});
			}
			
			if(to < pages){

				console.log(to,pages);
				if(to < (pages - 1)){
					pagesArr.push({
						page:'...',
						url:parsedUrl.pathname + '?p=' + to
					});
				}

				pagesArr.push({
					page:pages,
					url:parsedUrl.pathname + '?p=' + (pages - 1)
				});
			}

		}else{
			for(var i=1;i<=pages;i++){
				pagesArr.push({
					page:i,
					url:parsedUrl.pathname + (((i-1) == 0) ? '' : '?p=' + (i-1)),
					active:(options.page == i)});
			}
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