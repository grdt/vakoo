/**
 * @class CoreController
 * @augments CoreComponent
 * @param query {Query}
 */
var CoreController = function(query){

    var that = this;

	/**
	 * @type {Query}
	 */
    this.query = query;

	this.VIEW_NAMESPACE = null;

	const REQUEST_TIMEOUT = 5000;

	const RETURN_URL_PARAM = 'return';

	this.setFlash = function(type, title, message){
		if(typeof message == "undefined"){
			message = title;
			title = null;
		}
		var flashes = this.session('flash') || [];
		flashes.push({type:type,message:message,title:title});
		this.session('flash',flashes);
	}

	if(this.query){
		this.cookie = function(variable, value){
			return this.query.cookie(variable, value);
		}
	}else{
		this.cookie = function(){
//			console.log('not enought query. cookie not supported');
		}
	}
	

    this.index = function(){
        this.echo("method 'index' not found");
    }

	this.createReturnUrl = function(url){
		var returnUrl = url || this.query.referrer(),
			requestUrl = this.query.requestUrl();
		if(!this.get(RETURN_URL_PARAM)){
			var obj = {};
			obj[RETURN_URL_PARAM] = returnUrl;
			this.redirect(this.query.mergeUrl(requestUrl,obj));
		}
	}

    this.where = function(obj){
        this.query.response.send({
            admin:this.isAdmin(),
            executor:this.query.executor,
            "get":this.get(),
            "post":this.post(),
			"and":obj || false
        });
    }

    this.get = function(param, def){
        if(typeof param == "undefined"){
            return this.query.request.params;
        }else{
	        if(typeof this.query.executor[param] != "undefined"){
		        return this.query.executor[param];
	        }
			var empty = (typeof def == "undefined") ? null : def;
			var param = (typeof this.query.request.param(param) == "undefined") ? empty : this.query.request.param(param);
			if(param*1+'' === param){
				return param*1;
			}else{
				return param;
			}
        }
    }

    this.post = function(param){
        if(typeof param == "undefined"){
            if(this.query.request.method.toLowerCase() == 'post'){
                return this.query.request.body;
            }else{
                return false;
            }
        }else{
            return (typeof this.query.request.body[param] == "undefined") ? null : this.query.request.body[param];
        }
    }

	this.file = function(param){
		if(typeof param == "undefined"){
			return this.query.request.files;
		}else{
			return (typeof this.query.request.files[param] == "undefined") ? null : this.query.request.files[param];
		}
	}

    this.createUrl = function(executor){
        if(typeof executor == "undefined"){
            executor = {};
        }
        executor = executor.defaults(this.query.executor);
        return this.router().createUrl(executor);
    }

    this.redirect = function(url){
		this.cleanTimeout();
        if(typeof url == "undefined"){
            url = (this.isAdmin()) ? '/admin' :'/';
        }
        this.query.response.redirect(url);
    }

	this.back = function(){
		this.redirect(this.get(RETURN_URL_PARAM) || this.query.referrer());
	}

	this.display = function(view,data){
		if(this.VIEW_NAMESPACE){
			view = this.VIEW_NAMESPACE + '.' + view;
		}

		this.tmpl().display(view,data);
	}

	this.tmpl = function(){
		if(typeof this._tmpl != "undefined"){
			return this._tmpl;
		}

		var lib = this.vakoo.config().tmpl_lib;
		var tmpl = this.library(lib,{url:this.query,from:this});
		this._tmpl = tmpl;
		return tmpl;
	}

    this.json = function(data){
		this.cleanTimeout();
        this.query.response.send(data);
    }

    this.echo = function(data){
		this.cleanTimeout();
        if(!this.isAjax() && !this.isBot()){
            console.log(
                "\nurl:           `",
                this.query.requestUrl(),
                "`\nua:            `",
                this.query.request.headers["user-agent"],
                "`\nresponse-time: `",
                ((new Date()).getTime() - this.query.initializeTime),
                "`\ncity:          `",
                this.query.city.alias,
                "`"
             );
        }
        this.query.response.send(data);
    }

    this.isBot = function(){
        var ua = this.query.request.headers["user-agent"],
            isBot = false,
            bot = "unknown",
            sessId = this.query.request.sessionID;

        if (/yandex/i.test(ua)){
            bot = "yandex"
            isBot = true;
        }

        if (/google/i.test(ua)){
            bot = "google"
            isBot = true;
        }

        if (/bot/i.test(ua)){
            isBot = true;
        }

        if (/megaindex/i.test(ua)){
            bot = "megaindex";
            isBot = true;
        }

        if (/java/i.test(ua)){
            bot = "megaindex";
            isBot = true;
        }

        if(isBot){
            if(typeof this.query.request.session != "undefined"){
                this.query.request.session.destroy();
            }
        }

        return isBot;
    }

	this.isAjax = function(){
		return this.query.request.xhr;
	}

	this.exception = function(code,message){
		if(typeof message == "undefined"){
			message = code;
			code = 404;
		}
		this.query.response.status(code);
		this.query.response.send(message);
	}

    this.session = function(key,value){

        if(typeof this.query.request.session == "undefined"){
            return false;
        }

        if(typeof value == "undefined"){
            if(typeof key == "undefined"){
                return this.query.request.session;
            }else{
                return (typeof this.query.request.session[key] != "undefined") ? this.query.request.session[key] : null;
            }
        }else{
            if(value == null){
                if(typeof this.query.request.session[key] != "undefined"){
                    delete this.query.request.session[key];
                }
            }else{
                this.query.request.session[key] = value;
            }
        }

        return this;
    }

    this.destroySession = function(){
        this.session('user_id',null);
//        this.url.request.session.destroy();
//        this.url.response.clearCookie('connect.sid', { path: '/' });
    }

    this.files = function(param){
        if(!this.post())return false;

        if(typeof param == "undefined"){
            return this.query.request.files;
        }else{
            if(typeof this.query.request.files[param] != "undefined"){
                
                if(typeof this.query.request.files[param].size == "number"){
                    return (this.query.request.files[param].size) ? this.query.request.files[param] : null;
                }else{

                    var files = [];

                    this.query.request.files[param].forEach(function(file){
                        if(file.size){
                            files.push(file);
                        }
                    });

                    return (files.length) ? files : null;
                }
            }else{
                return null;
            }
        }
    }

    this.run = function(method){
		this.startTimeout();
        if(typeof this.__proto__[method] == "function" && this.__proto__[method] != that[method]){
            this.__proto__[method]()
        }else if (typeof this[method] == "function"){
            this[method]();
        }else{
            this.show404(404,'method not found',this.query.response);
        }
    }

	/**
	 * @param name
	 * @return CoreComponent
	 */
	this.option = function(name){
		if(typeof name == "undefined"){
			name = this.COMPONENT_NAME;
		}
		if(this.isAdmin() && name.indexOf('admin.') < 0){
			name = 'admin.' + name;
		}
		return this.parent().option(name);
	}

	this.model = function(name,options){
		if(typeof options == "undefined" && this.query){
			options = this.query;
		}

		return this.parent().model(name, options);
	}

	this.onRequestTimeout = function(){
		if(this._executiveController){
			this._executiveController.echo('Request TimedOut');
		}
	}

	this.startTimeout = function(timeout){
		var time = timeout || REQUEST_TIMEOUT;
		if(this.COMPONENT_NAME != 'admin' && typeof this.query != "undefined"){
			this.requestTimeout = setTimeout(function(){
				that.onRequestTimeout();
			}, time);
		}
	}

	this.cleanTimeout = function(){
		clearTimeout(this.requestTimeout);
	}
}


/**
 * @constructor
 * @extends CoreController
 * @property {CoreController} prototype
 */
var CoreAdminController = function(){
	/**
	 * @param name
	 * @return CoreAdminComponent
	 */
	this.option = function(){
		return this.parent().option();
	}
};


module.exports = CoreController;