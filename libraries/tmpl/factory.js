/**
 * @returns {TemplateFactory}
 * @constructor
 */
var TemplateFactory = function(){

	var $f = this;
	var that = this;

	this.TITLE_SEPARATOR = ' | ';

	this.meta = {
		title:this.config().title,
		description:'this default meta description',
		keywords:'this,default,meta,keywords'
	};

	this.flashTypes = {
		error:'danger',
		success:'success',
		warning:'warning',
		info:'info'
	}

	this.flashTitles = {
		error:'Ошибка!',
		success:'Успешно!',
		warning:'Внимание!',
		info:'Информация:'
	}

    this.city = this.from.query.city;

	this.get = function(param){
		return that.from.get(param);
	}
	
	this.title = function(titleOnly){

		if(typeof titleOnly == "undefined"){
			titleOnly = false;
		}

		var postfix = '';

		if($f.from.query.city && !titleOnly){
			postfix = ' в ' + $f.from.query.city.titles.in;
		}

		if(typeof $f._data == "undefined"){
			return $f.config().title + postfix;
		}
		if(typeof $f._data.title == "undefined"){
			return $f.config().title + postfix;
		}else{
			if(titleOnly){
				return $f._data.title;
			}
			return $f._data.title + $f.TITLE_SEPARATOR + $f.config().title + postfix;
		}
	}

	this.content = function(){
		$f._data.root = $f.rootUrl();
		var content = $f.compile($f.template($f._view),$f._data);
		return new $f.hbs.SafeString(content);
	}

	this.flash = function(){
		var flashes = $f.from.session('flash') || [];
		var data = {flashes:[]};
		flashes.forEach(function(flash){
			data.flashes.push({
				type:$f.flashTypes[flash.type],
				title:flash.title || $f.flashTitles[flash.type],
				message: flash.message
			});
		});
		$f.from.session('flash',null);
		var content = $f.compile($f.template('flash'),data);
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
			if($f._data && $f._data[modulename]){
				moduleArguments[modulename] = $f._data[modulename];
			}
			var result = module.render($f,moduleArguments);
			if(result){
				if(!result.data){
					result.data = {};
				}
				if(typeof result.data.vakoo == "undefined"){
					result.data.vakoo = $f.vakoo;
				}
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
	
	this.include = function(template,data){
		console.log(template);
	}

    return this;
}

module.exports = TemplateFactory;