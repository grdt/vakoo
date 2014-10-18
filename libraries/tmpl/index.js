var Handlebars = require('handlebars');
var HandlebarsHelpers = require('handlebars-helper');
HandlebarsHelpers.help(Handlebars);

/**
 * @extends Loader
 * @constructor
 */
var TemplateLibrary = function(params){
	var $l = this;
	var that = this;
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
	this._isAdmin = false;

	this.display = function(view,data){

		$l._data = data || {};
		$l._view = view;


		this.from.query.logTime('startDisplay');

		this.initPlugin('before_display',$l,function(){
			that.from.user(function(user){
				if(user && user.status == 'admin'){
					that._isAdmin = true;
				}

				var html = $l.layout()({
					factory:$l.factory(),
					root:$l.rootUrl()
				});

				that.from.query.logTime('echo html');
				that.from.echo(html);
			})
		});
	}

	this.render = function(view,data,ret){
		var html = this.template(view);
		data = data || {};
		data.factory = that.factory();
		data.root = that.rootUrl();
		var template = this.compile(html,data);
		if(typeof ret == "undefined"){
			that.from.echo(template);
		}else{
			if(ret)
				return template;
			else
				that.from.echo(template);
		}
	}

    this.compile = function(html,data){
		if(!html){
			console.log('html of template is not defined');
			return '';
		}

        var template = Handlebars.compile(html);

		data.factory = $l.factory();
        var compiled = template(data);
		return compiled;
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
			if(this._data && this._data.meta){
				this._factory.meta = this._data.meta;
			}
		    return this._factory
	    }
    }
	
	this.rootUrl = function(){
		return 'http://' + this.url.getHost();
	}

	this.helpers = function(){

		Handlebars.registerHelper('factory', function() {
			var args = Array.prototype.slice.call(arguments);

			if(!!args[0] && typeof $l.factory()[args[0]] == "function"){
				return $l.factory()[args[0]].apply(this, _.rest(args));
			}
			return null;
		});

		Handlebars.registerHelper('sizeMore', function(context, limit, options) {
			console.log();
		});

		Handlebars.registerHelper('timer', function(name) {
			console.time(name)
		});

		Handlebars.registerHelper('timerEnd', function(name) {
			console.timeEnd(name)
		});

		Handlebars.registerHelper('second', function(context, options) {

			var i = 0;

			for(var key in context){
				if(i == 1){
					return options.fn(context[key]);
				}
				i++;
			}
		});

		Handlebars.registerHelper('keyinRange', function(context, skip, limit, options) {

			if(typeof limit == "object"){
				options = limit;
				limit = skip - 1;
				skip = 0;
			}

			var ret = "";
			var i = 0;

			for(var key in context){
				if(i <= limit && i >= skip){
					ret = ret + options.fn(context[key]);
				}
				i++;
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

		Handlebars.registerHelper('keyin', function(context, options) {
			var ret = "";
			for(var key in context){
				ret = ret + options.fn(context[key]);
			}
			return ret;
		});



		Handlebars.registerHelper('isset', function(context, options) {
			if(typeof context != "undefined"){
				return options.fn(this);
			}else{
				return options.inverse(this);
			}
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

		Handlebars.registerHelper('production', function(options) {
			if(that.vakoo.isProduction()){
				return options.fn(this)
			}else{
				return options.inverse(this);
			}
		});

		Handlebars.registerHelper('admin', function(options) {
			if(that._isAdmin){
				return options.fn(this)
			}else{
				return options.inverse(this);
			}
		});


		/* template cache */
		var soMany = {};

		if(!this.from.isAdmin() && typeof soMany["shop.product-card"] == "undefined" && that.template("shop.product-card")){
			soMany["shop.product-card"] = Handlebars.compile(that.template("shop.product-card"));
		}

		/* template cache */

		Handlebars.registerHelper('include', function(templateName, data) {

			if(typeof soMany[templateName] == "function"){
				var string = soMany[templateName](data);
				var result = new that.hbs.SafeString(string);
				return result;
			}

			var html = that.template(templateName);

			if(html){

				var template = Handlebars.compile(html);
				data.factory = $l.factory();
				data.root = that.rootUrl();
				var string = template(data);
				var result = new that.hbs.SafeString(string);
				return result;
			}else{
				return false;
			}

		});


		Handlebars.registerHelper('trimString', function(string, length, postfix) {

			if(string.length < length){
				return string;
			}

			if(!_.isString(postfix)){
				postfix = '';
			}


			var trimmedString = string.substr(0, length);
			trimmedString = trimmedString.substr(0, Math.min(trimmedString.length, trimmedString.lastIndexOf(" ")))

			return trimmedString + postfix;
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

		Handlebars.registerHelper('json', function(context) {
			return JSON.stringify(context);
		});

		Handlebars.registerHelper('apply', function(object, method, params) {
			if(object && typeof object[method] == "function"){
				return object[method].apply(object,_.rest(arguments).slice(1,-1));
			}
		});

		Handlebars.registerHelper('partial', function(content) {
			var template = Handlebars.compile(content);
			var args = _.rest(arguments).slice(0,-1);
			var data = {};
			for(var key in args){
				for(var i in args[key]){
					data[i] = args[key][i];
				}
			}
			data.factory = $l.factory();
			return template(data);
		});


		Handlebars.registerHelper('number-format',function(number, decimals, dec_point, thousands_sep){

				if(typeof number == "function"){
					number = number();
				}
			
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


	this.helpers();

}

module.exports = TemplateLibrary;