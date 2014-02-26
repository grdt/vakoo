var fs = require('fs');

var loader = function(app){

    var _this = this;

    this._app = app;

    this.controller = function(option,name){
        if(option){

            var controller_path = _this._app.APP_PATH + '/components/'+ option +'/controllers/' + name;

            if(!fs.existsSync(controller_path + '.js')){
                controller_path = _this._app.APP_PATH + '/components/' +option + '/' + name;
            }

            if(fs.existsSync(controller_path + '.js')){
                var controller = new require(controller_path)();
                controller = _this._app._.extend(_this._app.controller,controller);
                controller.beforeInit();
                controller.init();

                return controller;
            }else{
                throw new Error('controller '+name+' of component '+option+' not exists');
            }
        }else{
            throw new Error('component-name not isset');
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