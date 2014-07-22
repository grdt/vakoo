/**
 * @class CoreController
 * @augments CoreComponent
 * @param url {Query}
 */
var CoreController = function(url){

    var _this = this;

	/**
	 * @type {Query}
	 */
    this.url = url;

	this.VIEW_NAMESPACE = null;

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

    this.index = function(){
        this.echo("method 'index' not found");
    }

	this.createReturnUrl = function(url){
		var returnUrl = url || this.url.referrer(),
			requestUrl = this.url.requestUrl();
		if(!this.get(RETURN_URL_PARAM)){
			var obj = {};
			obj[RETURN_URL_PARAM] = returnUrl;
			this.redirect(this.url.mergeUrl(requestUrl,obj));
		}
	}

    this.where = function(obj){
        this.url.response.send({
            admin:this.isAdmin(),
            executor:this.url.executor,
            "get":this.get(),
            "post":this.post(),
			"and":obj || false
        });
    }

    this.get = function(param, def){
        if(typeof param == "undefined"){
            return this.url.request.params;
        }else{
	        if(typeof this.url.executor[param] != "undefined"){
		        return this.url.executor[param];
	        }
			var empty = (typeof def == "undefined") ? null : def;
            return (typeof this.url.request.param(param) == "undefined") ? empty : this.url.request.param(param);
        }
    }

    this.post = function(param){
        if(typeof param == "undefined"){
            if(this.url.request.method.toLowerCase() == 'post'){
                return this.url.request.body;
            }else{
                return false;
            }
        }else{
            return (typeof this.url.request.body[param] == "undefined") ? null : this.url.request.body[param];
        }
    }

	this.file = function(param){
		if(typeof param == "undefined"){
			return this.url.request.files;
		}else{
			return (typeof this.url.request.files[param] == "undefined") ? null : this.url.request.files[param];
		}
	}

    this.createUrl = function(executor){
        if(typeof executor == "undefined"){
            executor = {};
        }
        executor = executor.defaults(this.url.executor);
        return this.router().createUrl(executor);
    }

    this.redirect = function(url){
        if(typeof url == "undefined"){
            url = (this.isAdmin()) ? '/admin' :'/';
        }
        this.url.response.redirect(url);
    }

	this.back = function(){
		this.redirect(this.get(RETURN_URL_PARAM) || this.url.referrer());
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
		var tmpl = this.library(lib,{url:this.url,from:this});
		return tmpl;
	}

    this.json = function(data){
        this.url.response.send(data);
    }

    this.echo = function(data){
        this.url.response.send(data);
    }

	this.isAjax = function(){
		return this.url.request.xhr;
	}

	this.exception = function(code,message){
		if(typeof message == "undefined"){
			message = code;
			code = 404;
		}
		this.url.response.status(code);
		this.url.response.send(message);
	}

    this.session = function(key,value){
        if(typeof value == "undefined"){
            if(typeof key == "undefined"){
                return this.url.request.session;
            }else{
                return (typeof this.url.request.session[key] != "undefined") ? this.url.request.session[key] : null;
            }
        }else{
            if(value == null){
                if(typeof this.url.request.session[key] != "undefined"){
                    delete this.url.request.session[key];
                }
            }else{
                this.url.request.session[key] = value;
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
            return this.url.request.files;
        }else{
            if(typeof this.url.request.files[param] != "undefined"){
                
                if(typeof this.url.request.files[param].size == "number"){
                    return (this.url.request.files[param].size) ? this.url.request.files[param] : null;
                }else{

                    var files = [];

                    this.url.request.files[param].forEach(function(file){
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
        if(typeof this[method] == "function"){
            this[method]();
        }else{
            this.show404(404,'method not found',this.url.response);
        }
    }

    return this;
}


/**
 * @constructor
 * @extends CoreController
 */
var CoreAdminController = function(){};


module.exports = CoreController;