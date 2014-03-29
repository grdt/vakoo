var _ = require('underscore');
var fs = require('fs');
var Susanin = require('susanin');


var Loader = function(vakoo){

    var loader = this;
    this.vakoo = vakoo;
    this._ = _;

    this.EXT_JS = '.js';
    this.EXT_JSON = '.json';


    this.SEPARATOR = '/';
    this.SYSTEM_PATH = __dirname.replace('/core','');
    this.APP_PATH = this.SYSTEM_PATH.replace('/system','');
    this.CONFIG_PATH = this.SYSTEM_PATH + this.SEPARATOR + 'config';
    this.COMPONENTS_PATH = this.APP_PATH + this.SEPARATOR + 'components';
    this.LIBRARIES_PATH = this.APP_PATH + this.SEPARATOR + 'libraries';
    this.TEMPLATES_PATH = this.APP_PATH + this.SEPARATOR + 'templates';

    this.DB_PATH = this.SYSTEM_PATH + this.SEPARATOR + 'database';

    this.DB_DRIVERS_PATH = this.DB_PATH + this.SEPARATOR + 'drivers';

    this._options = {};
    this._libraries = {};
    this._templates = {};

    this.execute = function(req,res){
        var url = this.url(req,res);
        var option = this.option(url.executor.option);
        if(option){
            option.execute(url);
        }else{
            this.showError(404,'Component not found',res);
        }
    }

    this.option = function(name){
        if(!!this._options[name]){
            return this._options[name];
        }else{
            return false;
        }
    }

    this.preload = function(){

        //----load components ---

        var Component = require('./component');
        Component.prototype = this;
        this.getDirs(this.COMPONENTS_PATH).forEach(function(option){
            loader._options[option] = new Component(option);
        });


        this.preloadDB();
    }


    this.preloadDB = function(){
        if(typeof this.vakoo.config().db != "undefined"){
            var Db = require('../database/index');
            Db.prototype = this;
            this.db = new Db(this.vakoo.config().db);
        }
    }

    this.isDir = function(path){
        if(!this.fileExists(path))return false;
        return fs.lstatSync(path).isDirectory();
    }

    this.isFile = function(path){
        return fs.lstatSync(path).isFile();
    }

    this.getDirs = function(path){
        var files = fs.readdirSync(path);
        var result = [];
        files.forEach(function(file){
            if(loader.isDir(path + loader.SEPARATOR + file)){
                result.push(file);
            }
        });

        return result;
    }

    this.getFiles = function(path){
        var files = fs.readdirSync(path);
        var result = [];
        files.forEach(function(file){
            if(loader.isFile(path + loader.SEPARATOR + file)){
                result.push(file);
            }
        });

        return result;
    }

    this.getExtension = function(path) {
        var i = path.lastIndexOf('.');
        return (i < 0) ? '' : path.substr(i);
    }

    this.fileExists = function(path){
        return fs.existsSync(path);
    }

    this.url = function(req,res){
        var url = require('./url');
        url.prototype = this;
        return new url(req,res);
    }

    this.router = function(){

        if(!!this._router)return this._router;

        var router = require('./router');
        router.prototype = this;
        this._router = new router();
        return this._router;
    }

    this.routes = function(){
        if(!!this._routes)return this._routes;

        var routes = (fs.existsSync(this.APP_PATH + this.SEPARATOR + 'routes' + this.EXT_JSON)) ? require(this.APP_PATH + this.SEPARATOR + 'routes' + this.EXT_JSON) : {};

        this._routes = [];
        
        for(key in routes){
            var route = Susanin.Route('/'+key);
            route.executor = routes[key];
            this._routes.push(route);
        }

        return this._routes;

    }

    this.show404 = function(code,message,res){
       res.send({code:code,message:message});
    }


    this.preload();

    return this;
}

module.exports = Loader;
