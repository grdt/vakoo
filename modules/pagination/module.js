var url = require('url');

var Pagination = function(){

	this.foo = 'bar';

	this.render = function(factory,input){
		var options = _.last(input);
		var pages = Math.ceil(options.count / options.perPage);
		var pagesArr = [];
		var link = factory.from.query.request.url;

		if(factory.from.get('p')){
			link = link.replace('?p='+factory.from.get('p'),'');
			link = link.replace('&p='+factory.from.get('p'),'');
		}

		var parsedUrl = url.parse(link);
		var PAGE = '?p=';

		if(parsedUrl.query){
			PAGE = '&p=';
		}

		var pagesMax = 20;

		if(pages > pagesMax){

			var from = (options.page - pagesMax/2);
			var to = (options.page + pagesMax/2);
			var addedBefore = 0;
			var addedAfter = 0;

			for(var i=from; i<options.page; i++){
				if(i>0){
					pagesArr.push({
						page:i,
						url:link + (((i-1) == 0) ? '' : PAGE + (i-1)),
						active:(options.page == i)});
					addedBefore++;
				}
			}

			for(var i=options.page; i<=to; i++){
				if(i<=pages){
					pagesArr.push({
						page:i,
						url:link + (((i-1) == 0) ? '' : PAGE + (i-1)),
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
						url:link + PAGE + firstDotes
					});
				}

				pagesArr.unshift({
					page:1,
					url:link
				});
			}
			
			if(to < pages){
				if(to < (pages - 1)){
					pagesArr.push({
						page:'...',
						url:link + PAGE + to
					});
				}

				pagesArr.push({
					page:pages,
					url:link + PAGE + (pages - 1)
				});
			}

		}else{
			for(var i=1;i<=pages;i++){
				pagesArr.push({
					page:i,
					url:link + (((i-1) == 0) ? '' : PAGE + (i-1)),
					active:(options.page == i)});
			}
		}

		var prev = {
			url:link + (((options.page - 2) == 0) ? '' : PAGE + (options.page - 2)),
			enable:false
		};

		if(options.page > 1){
			prev.enable = true;
		}

		var next = {
			url:link + PAGE + options.page,
			enable:false
		};

		if(options.page != pages){
			next.enable = true;
		}

		return {view:'modules.pagination',data:{pagesArr:pagesArr,prev:prev,next:next}};
	}

	/**
	 * @param {CoreModel} model
	 * @param {number} perPage
	 * @param {number} page
	 * @param {function} callback
	 */
	this.get = function(model, perPage, page, callback){
		model.count(function(count){
			var limit = [0,perPage],
				pagination = false;
			if(perPage < count){
				limit = [page * perPage, perPage];
				pagination = {page:page + 1,count:count,perPage:perPage};
			}

			model.limit(limit).find(function(result){
				callback(result,pagination);
			});
		});
	}
}

module.exports = Pagination;