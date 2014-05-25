
var Factory = function(){

	var $f = this;

	this.TITLE_SEPARATOR = ' | ';

	this.meta = {
		title:this.config().title,
		desc:'desc',
		keywords:'key1,key2,key3'
	};

	this.title = function(){
		if(typeof $f._data == "undefined"){
			return $f.config().title;
		}
		if(typeof $f._data.title == "undefined"){
			return $f.config().title;
		}else{
			return $f._data.title + $f.TITLE_SEPARATOR + $f.config().title;
		}
	}

	this.content = function(){
		var content = $f.compile($f.template($f._view),$f._data);
		return new $f.hbs.SafeString(content);
	}

	this.module = function(modulename){
		var args = _.initial(Array.prototype.slice.call(arguments));
		var module = $f.vakoo.load.module(modulename);
		if(module){
			var moduleArguments = [];
			moduleArguments.push($f);
			moduleArguments.push($f._data);
			moduleArguments = moduleArguments.concat(_.rest(args));
			var result = module.render.apply(this,moduleArguments);
			if(result){
				var content = $f.compile($f.template(result.view),result.data);
				return new $f.hbs.SafeString(content);
			}else{
				return false;
			}
		}else{
			return false;
		}

	}

	this.data = function(context,variable){
		if(typeof $f._data != "undefined"){
			if(typeof $f._data[context] != "undefined"){
				if(typeof $f._data[context][variable] != "undefined"){
					if(typeof $f._data[context][variable] == "function"){
						return $f._data[context][variable]();
					}else
						return $f._data[context][variable];
				}
			}
		}
	}

	this.css = function(source){
		return new $f.hbs.SafeString('<link rel="stylesheet" href="'+source+'">');
	}

	this.js = function(source){
		return new $f.hbs.SafeString('<script type="text/javascript" src="'+source+'"></script>');
	}

    return this;
}

module.exports = Factory;