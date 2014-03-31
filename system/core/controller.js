var Controller = function(url){

    var _this = this;

    this.url = url;

    this.index = function(){

    }

    this.where = function(){
        this.url.response.send(this.url.executor);
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
        executor = this._.defaults(executor,this.url.executor);
        return this.router().createUrl(executor);
    }

    this.redirect = function(url){
        this.url.response.redirect(url);
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