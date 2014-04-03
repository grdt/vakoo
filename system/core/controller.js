var Controller = function(url){

    var _this = this;

    this.url = url;



    this.index = function(){
        this.echo("method 'index' not found");
    }

    this.where = function(){
        this.url.response.send({
            admin:this.isAdmin(),
            executor:this.url.executor,
            "get":this.get(),
            "post":this.post()
        });
    }

    this.get = function(param){
        if(typeof param == "undefined"){
            return this.url.request.params;
        }else{
            return (typeof this.url.request.param(param) == "undefined") ? null : this.url.request.param(param);
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

    this.createUrl = function(executor){
        if(typeof executor == "undefined"){
            executor = {};
        }
        executor = this._.defaults(executor,this.url.executor);
        return this.router().createUrl(executor);
    }

    this.redirect = function(url){
        if(typeof url == "undefined"){
            url = (this.isAdmin()) ? '/admin' :'/';
        }
        this.url.response.redirect(url);
    }

    this.render = function(view,data){
        var lib = this.vakoo.config().tmpl_lib;
        var tmpl = this.library(lib,{url:this.url,from:this});
        if(typeof data == "undefined"){
            data = {};
        }
        tmpl.render(view,data);
        return this;
    }

    this.json = function(data){
        this.url.response.send(data);
    }

    this.echo = function(data){
        this.url.response.send(data);
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


module.exports = Controller;