var Factory = function(){

	var $f = this;

	this.meta = {
		title:this.config().title,
		desc:'desc',
		keywords:'key1,key2,key3'
	};

	this.title = this.config().title;

	this.content = function(){
		var content = $f.compile($f.template($f._view),$f._data);
		return new $f.hbs.SafeString(content);
	}

	this.module = function(module){
		var args = _.initial(Array.prototype.slice.call(arguments));
		console.log(module);
		console.log(args);
		return 'aza';
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