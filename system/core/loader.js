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
                controller = _this._app._.extend(this._app.controller,controller);
                return controller.beforeInit().init();
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

    this.model = function(name){
        var option = this._app.router.option;
        var path = this._app.APP_PATH + '/components/' + option + '/models/' + name;

        if(fs.existsSync(path + this.EXT)){
            var model = new require(path);
            model.prototype = this._app.db.driver;
            return model;
        }else{
            throw new Error('model '+name+' not found');
        }

    }

    this.getControllerPath = function(option){
        return [
            _this._app.APP_PATH + '/components/'+ option,
            _this._app.APP_PATH + '/components/'+ option + '/controllers'
        ];
    }

    this.config = function(path){
        if(typeof path == "undefined"){
            path = _this._app.APP_PATH + '/config';
        }

        var config = require(path);
        return config;
    }

    return this;
}

module.exports = loader;