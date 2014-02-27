var controller = function(app){

    if(typeof app == "undefined"){
        throw new Error("App in undefined");
    }

    var _this = this;

    this._app = app;

    this.h = {};

    this.run = function(method){
        if(typeof this[method] == "function"){
            this[method]();
        }else{
            this.show404('method '+method+' not found');
        }
    }

    this.beforeInit = function(){
        console.log('controller before init');
        this.req = _this._app.router.request;
        this.res = _this._app.router.response;
        return this;
    }

    this.show404 = function(mess){
        this._app.router.show404(mess);
    }

    this.send = function(data){
        this.res.send(data);
    }

    this.req = function(data){

    }

    this.init = function(){return this;}

    this.where = function(){
        this.send({
            option:this._app.router.option,
            controller:this._app.router.controller,
            method:this._app.router.method,
        });
    }

    return this;
}

module.exports = controller;