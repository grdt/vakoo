var Plugin = function(){
	var $p = this;

	this.callback = false;

	this.init = function($l,view,data,callback,next){
		if(typeof data == "undefined"){
			data = {};
		}
		
		if(!$l.from.session('history')){
			data.history = {};
			$l.from.session('history',{});
		}else{
			var history = $l.from.session('history');
			var title = $l.factory().title().replace($l.factory().TITLE_SEPARATOR,'').replace($l.factory().config().title,'');
			var url = $l.from.url.request.url;
			if(title == ''){
				title = $l.factory().config().title;
			}
			data.history = history;

			history[url] = {
				title:title,
				date:new Date(),
				url:url
			}

			var sorted = _.sortBy(history,function(item){
				return new Date(item.date).getTime();
			});

			sorted.reverse();
			
			history = {};

			sorted.forEach(function(item){
				history[item.url] = item;
			});

			$l.from.session('history',history);
		}

		if(typeof callback == "function"){
			callback($l,view,data,next);
		}else{
			if(this.callback && typeof this.callback == "function"){
				console.log(this.callback);
				this.callback(view,data);
			}
		}

	}
}

module.exports = Plugin;