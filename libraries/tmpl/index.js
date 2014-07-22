var Handlebars = require('handlebars');
var HandlebarsHelpers = require('handlebars-helper');
HandlebarsHelpers.help(Handlebars);

var Tmpl = function(params){

	var $l = this;
	this.hbs = Handlebars;

    if(!!params.url){
        this.url = params.url;
    }

    if(!!params.from){
        this.from = params.from;
    }

	this._data = null;
	this._view = null;
	this._layout = null;
	this._config = null;
	this._factory = null;

	this.display = function(view,data){

		$l._data = data;
		$l._view = view;

		this.initPlugin('before_display',this,view,data,function(l,view,data){
			$l._data = data;
			$l._view = view;
			var html = $l.layout()({factory:$l.factory()});
			$l.url.response.send(html);
		});
	}

	this.render = function(view,data,ret){
		var html = this.template(view);
		var template = this.compile(html,data);
		if(typeof ret == "undefined"){
			$l.url.response.send(template);
		}else{
			if(ret)
				return template;
			else
				$l.url.response.send(template);
		}
	}

    this.compile = function(html,data){
        var template = Handlebars.compile(html);
		data.factory = $l.factory();
        return template(data);
    }
    
    this.template = function(name){
		var template = this.from.template(name);
		return template || '';
    }

    this.layout = function(layout){
		if(typeof layout != "undefined"){
			var templates_destination = (this.from.isAdmin()) ? this._admin_templates : this._templates;
			if(!!templates_destination['layout_' + layout]){
				var lay = Handlebars.compile(templates_destination['layout_' + layout]);
				this._layout = lay;
				return this;
			}else{
				throw new Error('layout not found');
			}
		}
	    if(this._layout){
		    return this._layout;
	    }
        var templates_destination = (this.from.isAdmin()) ? this._admin_templates : this._templates;
        if(!!templates_destination.layout){
            var lay = Handlebars.compile(templates_destination.layout);
	        this._layout = lay;
            return this._layout;
        }else{
            throw new Error('layout not found');
        }
    }


    this.factory = function(){
	    if(this._factory){
			return this._factory;
	    }else{
		    this.helpers();
		    var Factory = require('./factory');
		    Factory.prototype = this;
		    this._factory = new Factory;
		    return this._factory
	    }
    }

	this.helpers = function(){
		Handlebars.registerHelper('factory', function() {
			var args = Array.prototype.slice.call(arguments);

			if(!!args[0] && typeof $l.factory()[args[0]] == "function"){
				return $l.factory()[args[0]].apply(this, _.rest(args));
			}
			return null;
		});

		Handlebars.registerHelper('keyin', function(context, options) {
			var ret = "";
			for(var key in context){
				ret = ret + options.fn(context[key]);
			}
			return ret;
		});

		Handlebars.registerHelper('keyIn', function(context, options) {
			var ret = "";
			for(var key in context){
				ret = ret + options.fn(context[key]);
			}
			return ret;
		});

		Handlebars.registerHelper('keys', function(context, options) {
			var ret = "";
			for(var key in context){
				var content = {};
				content['key'] = key;
				content['val'] = context[key];
				ret = ret + options.fn(content);
			}
			return ret;
		});
		
		Handlebars.registerHelper('row',function(context,inRow,options){
			if(typeof options == "undefined"){
				var options = inRow;
				var inRow = 4;
			}
			var result = '';
			for(var i=0;i<Math.ceil(context.length / inRow);i++){
				var items = [];
				for(var y=0;y<inRow;y++){
					if(typeof context[i*inRow + y] != "undefined")
						items.push(context[i*inRow + y]);
				}
				result += options.fn({rowId:i,items:items});
			}
			return result;
		});

		Handlebars.registerHelper('text-count',function(items,type){
			if(_.isString(type)){
				var text = $l.counters[type];
				var count = _.isArray(items) ? items.length : items;
				var ending;

				var number = count % 100;
				if (number>=11 && number<=19) {
					ending=text[2];
				}
				else {
					var i = number % 10;
					switch (i)
					{
						case (1): ending = text[0]; break;
						case (2):
						case (3):
						case (4): ending = text[1]; break;
						default: ending=text[2];
					}
				}

				return count + ' ' + ending;
			}else{
				return false;
			}
		});

		Handlebars.registerHelper('number-format',function(number, decimals, dec_point, thousands_sep){
				var i, j, kw, kd, km;
				if( isNaN(decimals = Math.abs(decimals)) ){
					decimals = 0;
				}
				if( dec_point == undefined ){
					dec_point = ".";
				}
				if( thousands_sep == undefined ){
					thousands_sep = " ";
				}

				i = parseInt(number = (+number || 0).toFixed(decimals)) + "";

				if( (j = i.length) > 3 ){
					j = j % 3;
				} else{
					j = 0;
				}

				km = (j ? i.substr(0, j) + thousands_sep : "");
				kw = i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands_sep);
				//kd = (decimals ? dec_point + Math.abs(number - i).toFixed(decimals).slice(2) : "");
				kd = (decimals ? dec_point + Math.abs(number - i).toFixed(decimals).replace(/-/, 0).slice(2) : "");

				return km + kw + kd;
		});
	}


	this.counters = {
		'product':['товар','товара','товаров']
	};


	this.config = function(){
		if(this._config){
			return this._config;
		}else{
			var config = require(this.vakoo.APP_PATH + '/config.json');
			this._config = config;
			return this._config;
		}
	}

    this.preload = function(){

    }

	this.helpers();

    return this;

}

module.exports = Tmpl;