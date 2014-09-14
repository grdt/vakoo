var Url = require('url');

var Plugin = function(){
	var $p = this;

	this.callback = false;

	this.init = function($l,next){

		if(!$l.from.session('history')){
			$l._data.history = {};
			$l.from.session('history',{});
		}else{
			var history = $l.from.session('history');
			var title = $l.factory().title(true);
			var url = Url.parse($l.from.query.request.url).pathname;
			if(this.vakoo.ENVIRONMENT == 'development'){
				url = $l.from.query.request.url;
			}
			$l._data.history = history;

			history[url] = {
				title:title,
				date:new Date(),
				url:url
			}

			var sorted = _.sortBy(history,function(item){
				return new Date(item.date).getTime();
			});

			sorted = sorted.reverse().slice(0,11);
			
			history = {};

			sorted.forEach(function(item){
				history[item.url] = item;
			});

			$l.from.session('history',history);
//			if(_.size(history) > 1){
//				delete history[_.first(_.keys(history))];
//			}
			$l._data.history = history;
		}

		if(typeof next == "function"){
			next($l);
		}

	}
}

module.exports = Plugin;