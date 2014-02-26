var fs = require('fs');

var loader = function(app){

    var _this = this;

    this._app = app;

    this.controller = function(option,name){
        if(option){

        }else{
            if(fs.existsSync(_this._app.APP_PATH + '/controllers/' + name + '.js')){
                var controller = new require(_this._app.APP_PATH + '/controllers/' + name)(_app);
                controller = _this._app._.extend(_this._app.controller,controller);
                controller.beforeInit();
                controller.init();
                return controller;
            }else{
                throw new Error('controller '+name+' not exists');
            }
        }
    }

    this.helper = function(name){
        if(fs.existsSync(_this._app.APP_PATH + '/helpers/' + name + '.js')){
            var helper = require(_this._app.APP_PATH + '/helpers/' + name);
            this._app.h[name] = helper;
        }else{
            throw new Error('helper '+name+' not exists');
        }
    }

    return this;
}

module.exports = loader;