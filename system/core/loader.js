var _ = require('underscore');
var fs = require('fs');
var Susanin = require('susanin');
var url = require('url');

var Loader = function(vakoo){

    var loader = this;
    this.vakoo = vakoo;
    this._ = _;

    this.EXT_JS = '.js';
    this.EXT_JSON = '.json';
    this.EXT_VIEW = '.twig';


    this.SEPARATOR = '/';
    this.SYSTEM_PATH = __dirname.replace('/core','');
    this.APP_PATH = this.SYSTEM_PATH.replace('/system','');
    this.CONFIG_PATH = this.SYSTEM_PATH + this.SEPARATOR + 'config';
    this.COMPONENTS_PATH = this.APP_PATH + this.SEPARATOR + 'components';
    this.LIBRARIES_PATH = this.APP_PATH + this.SEPARATOR + 'libraries';

    this.TEMPLATES_PATH = this.APP_PATH + this.SEPARATOR + 'templates';

    this.TEMPLATE_PATH = this.TEMPLATES_PATH + this.SEPARATOR + this.vakoo.config().template;

    this.ADMIN_TEMPLATE = 'admin';

    this.ADMIN_TEMPLATE_PATH = this.TEMPLATES_PATH + this.SEPARATOR + this.ADMIN_TEMPLATE;

    this.DB_PATH = this.SYSTEM_PATH + this.SEPARATOR + 'database';

    this.DB_DRIVERS_PATH = this.DB_PATH + this.SEPARATOR + 'drivers';

    this._options = {};
    this._libraries = {};
    this._templates = {};
    this._admin_templates = {};

    this._components_routes = [];

    this.execute = function(req,res){
        var url = this.url(req,res);
        var option = this.option(url.executor.option);
        if(option){
            option.execute(url);
        }else{
            this.show404(404,'Component not found',res);
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
        var AdminComponent = require('./admin_component');
        Component.prototype = this;
        this.getDirs(this.COMPONENTS_PATH).forEach(function(option){
            loader._options[option] = new Component(option);
            if(option != 'admin'){
                AdminComponent.prototype = loader._options[option];
                loader._options['admin.'+option] = new AdminComponent();
            }else{
                AdminComponent.prototype = loader._options[option];
                loader._options[option] = new AdminComponent();
                console.log(loader._options[option]);
            }
        });

        //----load templates ----

        this.preloadTemplates();

        // ---- load libraries ---

        var Library = require('./library');

        Library.prototype = this;
        this.getDirs(this.LIBRARIES_PATH).forEach(function(lib){
              loader._libraries[lib] = new Library(lib);
        });


        // --- load default libs --- 


        this.preloadDB();
    }

    this.preloadTemplates = function(){
        for(var option in this._options){

            var compare = this.getCompare(this._options[option].VIEW_PATH,'admin');

            var tmpl_compare = this.getCompare(this.TEMPLATE_PATH + this.SEPARATOR + 'components' + this.SEPARATOR + option);

            compare = _.defaults(tmpl_compare,compare);

            if(!_.isEmpty(compare)){
                this._templates[option] = {};
                for(var key in compare){
                    this._templates[option][key] = fs.readFileSync(compare[key],'utf8');
                }
            }else{
                this._templates[option] = null;
            }

            var admin_compare = this.getCompare(this._options[option].VIEW_PATH + this.SEPARATOR + this.ADMIN_TEMPLATE);

            var admin_tmpl_compare = this.getCompare(this.ADMIN_TEMPLATE_PATH + this.SEPARATOR + 'components' + this.SEPARATOR + option);

            admin_compare = _.defaults(admin_tmpl_compare,admin_compare);

            if(!_.isEmpty(admin_compare)){
                this._admin_templates[option] = {};
                for(var key in admin_compare){
                    this._admin_templates[option][key] = fs.readFileSync(admin_compare[key],'utf8');
                }
            }else{
                this._admin_templates[option] = null;
            }
        }

        var template_compare = this.getCompare(this.TEMPLATE_PATH,'components');
        if(!_.isEmpty(template_compare)){
            for(var key in template_compare){
                if(!!this._templates[key]){
                    throw new Error('view '+template_compare[key]+' cant named as component');
                }else{
                    this._templates[key] = fs.readFileSync(template_compare[key],'utf8');
                }
            }
        }

        var admin_template_compare = this.getCompare(this.ADMIN_TEMPLATE_PATH,'components');

        if(!_.isEmpty(admin_template_compare)){
            for(var key in admin_template_compare){
                if(!!this._admin_templates[key]){
                    throw new Error('admin view '+template_compare[key]+' cant named as component');
                }else{
                    this._admin_templates[key] = fs.readFileSync(admin_template_compare[key],'utf8');
                }
            }
        }
    }

    this.getCompare = function(path,exclude){
        var compare = {};
        var directory = this.parseDirectory(path,exclude);
        if(directory){
            compare = this.compareDirectory(path,directory);
        }

        return compare;
    }

    this.compareDirectory = function(path,directory,templates,tmpl_key){

        if(typeof templates == "undefined"){
            templates = {};
        }

        if(typeof tmpl_key == "undefined"){
            tmpl_key = '';
        }

        for(key in directory){
            if(typeof directory[key] == "string"){
                var tkey = directory[key].replace(this.EXT_VIEW,'');
                if(tmpl_key)
                    tkey = tmpl_key + '.' + tkey;
                
                templates[tkey] = path + this.SEPARATOR + directory[key];
                
                if(directory[key].replace(this.EXT_VIEW,'') == 'index' && typeof templates[tmpl_key] == "undefined"){
                    templates[tmpl_key] = templates[tkey];
                }
            }
            
            if(typeof directory[key] == "object"){
                this.compareDirectory(path + this.SEPARATOR + key,directory[key],templates,key);
            }
        }
        
        return templates;
    }
    
    this.parseDirectory = function(path,exclude){
        if(typeof exclude == "undefined"){
            exclude = [];
        }else{
            if(typeof exclude == "string"){
                exclude = [exclude];
            }
        }
        if(this.isDir(path)){
            var directory = [];
            this.getFiles(path,exclude).forEach(function(file){
                directory.push(file);
            });
            
            this.getDirs(path,exclude).forEach(function(dir){
                directory[dir] = loader.parseDirectory(path + loader.SEPARATOR + dir);
            });

            return directory;
            
        }else{
            return null;
        }
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

    this.getDirs = function(path,exclude){
        if(typeof exclude == "undefined"){
            exclude = [];
        }else{
            if(typeof exclude == "string"){
                exclude = [exclude];
            }
        }
        var files = fs.readdirSync(path);
        var result = [];
        files.forEach(function(file){
            if(exclude.indexOf(file) < 0 && loader.isDir(path + loader.SEPARATOR + file)){
                result.push(file);
            }
        });

        return result;
    }

    this.getFiles = function(path,exclude){
        if(typeof exclude == "undefined"){
            exclude = [];
        }else{
            if(typeof exclude == "string"){
                exclude = [exclude];
            }
        }
        var files = fs.readdirSync(path);
        var result = [];
        files.forEach(function(file){
            if(exclude.indexOf(file) < 0 && loader.isFile(path + loader.SEPARATOR + file)){
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


        //----load main routes ----
        var routes = (fs.existsSync(this.APP_PATH + this.SEPARATOR + 'routes' + this.EXT_JSON)) ? require(this.APP_PATH + this.SEPARATOR + 'routes' + this.EXT_JSON) : {};

        this._routes = [];
        
        for(key in routes){
            var route = Susanin.Route('/'+key);
            route.executor = routes[key];
            this._routes.push(route);
        }

        //------load components routes

        if(this._components_routes.length){
            for(i in this._components_routes){
                var routes = this._components_routes[i];
                for(key in routes){
                    var route = Susanin.Route('/'+key);
                    route.executor = routes[key];
                    route.buildUrl = function(params){
                        var parts = url.parse(this.build(params),true);
                        delete parts.query.method;
                        delete parts.query.controller;
                        delete parts.query.option;
                        delete parts.search;
                        return url.format(parts);
                    }
                    this._routes.push(route);
                }
            }
        }

        // --- end of load

        return this._routes;

    }

    this.show404 = function(code,message,res){
       res.send({code:code,message:message});
    }

    this.parent = function(){
        return this.__proto__;
    }


    this.preload();

    return this;
}

module.exports = Loader;
