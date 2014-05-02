var Handlebars = require('handlebars');

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
		this._data = data;
		this._view = view;
		var html = this.layout()({factory:this.factory()});
		this.url.response.send(html);
	}

    this.compile = function(html,data){
        var template = Handlebars.compile(html);
        return template(data);
    }
    
    this.template = function(name){
        return this.from.template(name);
    }

    this.layout = function(){
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
			for(key in context){
				ret = ret + options.fn(context[key]);
			}
			return ret;
		});
	}


	this.config = function(){
		if(this._config){
			return this._config;
		}else{
			var config = require('./config.json');
			this._config = config;
			return this._config;
		}
	}

    this.preload = function(){

    }

    return this;

}

module.exports = Tmpl;