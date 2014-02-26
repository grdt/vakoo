var fs = require('fs');

var loader = function(app){

    var _this = this;

    this._app = app;

    this.EXT = '.js';

    this.controller = function(option,name){
        if(option){

            var path = this.getControllerPath(option);
            var controller_path = false;

            for(i in path){
                if(fs.existsSync(path[i] + '/' + name + this.EXT)){
                    controller_path = path[i] + '/' + name;
                }
            }

            if(!controller_path && name == 'controller'){
                name = 'index';
                for(i in path){
                    if(fs.existsSync(path[i] + '/' + name + this.EXT)){
                        controller_path = path[i] + '/' + name;
                    }
                }
                this._app.router.controller = 'index';
            }

            if(controller_path){
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
        if(fs.existsSync(_this._app.APP_PATH + '/helpers/' + name + this.EXT)){
            var helper = require(_this._app.APP_PATH + '/helpers/' + name);
            this._app.h[name] = helper;
        }else{
            throw new Error('helper '+name+' not exists');
        }
    }

    this.getControllerPath = function(option){
        return [
            _this._app.APP_PATH + '/components/'+ option,
            _this._app.APP_PATH + '/components/'+ option + '/controllers'
        ];
    }

    return this;
}

module.exports = loader;