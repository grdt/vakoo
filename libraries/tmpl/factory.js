
var Factory = function(){

	var $f = this;

	this.meta = {
		title:this.config().title,
		desc:'desc',
		keywords:'key1,key2,key3'
	};

	this.title = function(){
		if(typeof $f._data.title == "undefined"){
			return $f.config().title;
		}else{
			return $f._data.title + ' | ' + $f.config().title;
		}
	}

	this.content = function(){
		var content = $f.compile($f.template($f._view),$f._data);
		return new $f.hbs.SafeString(content);
	}

	this.module = function(modulename){
		var args = _.initial(Array.prototype.slice.call(arguments));
		var module = $f.vakoo.load.module(modulename);
		var result = module.render($f,$f._data[modulename]);
		var content = $f.compile($f.template(result.view),result.data);
		return new $f.hbs.SafeString(content);
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