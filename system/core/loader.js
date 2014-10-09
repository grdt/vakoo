var Susanin = require('susanin');
var url = require('url');

/**
 * @class Loader
 * @augments Vakoo
 */
var Loader = function(vakoo){

    var loader = this;
    this.vakoo = vakoo;

    this.EXT_JS = '.js';
    this.EXT_JSON = '.json';
    this.EXT_VIEW = '.hbs';

	this.DEFAULT_COMPONENT = 'main';


    this.SEPARATOR = '/';
    this.SYSTEM_PATH = __dirname.replace('/core','');
    this.APP_PATH = this.SYSTEM_PATH.replace('/system','');
    this.CONFIG_PATH = this.SYSTEM_PATH + this.SEPARATOR + 'config';
    this.COMPONENTS_PATH = this.APP_PATH + this.SEPARATOR + 'components';
    this.MODULES_PATH = this.APP_PATH + this.SEPARATOR + 'modules';
    this.PLUGINS_PATH = this.APP_PATH + this.SEPARATOR + 'plugins';
    this.LIBRARIES_PATH = this.APP_PATH + this.SEPARATOR + 'libraries';

    this.TEMPLATES_PATH = this.APP_PATH + this.SEPARATOR + 'templates';

    this.TEMPLATE_PATH = this.TEMPLATES_PATH + this.SEPARATOR + this.vakoo.config().template;

    this.ADMIN_TEMPLATE = 'admin';

    this.ADMIN_TEMPLATE_PATH = this.TEMPLATES_PATH + this.SEPARATOR + this.ADMIN_TEMPLATE;

    this.DB_PATH = this.SYSTEM_PATH + this.SEPARATOR + 'database';

    this.DB_DRIVERS_PATH = this.DB_PATH + this.SEPARATOR + 'drivers';

    this._options = {};
	this._modules = {};
	this._plugins = {};
    this._libraries = {};
    this._templates = {};
    this._admin_templates = {};

	this._routes = [];

	this._router_init = false;

    this._components_routes = [];

    this.execute = function(req,res){
        var query = this.query(req,res);
		this.initPlugin('query',query,function(query){
			var option = loader.option(query.executor.option);
			if(option){
				option.execute(query);
			}else{
				loader.show404(404,'Component not found',res);
			}
		});

    }

	/**
	 * @returns CoreComponent
	 */
    this.option = function(name){
		if(typeof name == "undefined"){
			if(typeof this.COMPONENT_NAME != "undefined"){
				name = this.COMPONENT_NAME;
			}else{
				name = this.DEFAULT_COMPONENT;
			}
		}
        if(!!this._options[name]){
            return this._options[name];
        }else{
            return false;
        }
    }


	this.module = function(namespace,name){
		var modulename;
		var module;
		if(typeof name == "undefined" || !_.isString(name)){
			var m = namespace.split(':');
			module = m[0];
			modulename = m[1];
		}else{
			module = namespace;
			modulename = name;
		}

		if(!!this._modules[module]){
			if(typeof modulename == "undefined" && this._modules[module]._module){
				return this._modules[module]._module;
			}
			return this._modules[module].submodule(modulename);
		}else{
			return false;
		}

	}

	this.initPlugin = function(event){
		var args = _.rest(Array.prototype.slice.call(arguments));
		var async = require('async');
		if(!!this._plugins[event]){
			if(this._plugins[event].length == 1){
				if(typeof this._plugins[event][0].init == "function"){
					this._plugins[event][0].init.apply(this, args);
				}
			}else{

				var callable = [];
				var callback = function(){};
				var runs = [];

				if(typeof _.last(args) == "function"){
					callback = _.last(args);
					args.pop();
				}


				for(var key in this._plugins[event]){
					if(typeof this._plugins[event][key].callback != "undefined"){
						this._plugins[event][key].callback = callback;
						callable.push({handler:this._plugins[event][key].init,args:args});
						var handler = this._plugins[event][key].init;
						runs.push(
							handler.bind(null,args)
						);
					}else{
						if(typeof this._plugins[event][key].init == "function"){
							this._plugins[event][key].init.apply(this, args);
						}
					}
				}

				async.parallel(runs,function(err,result){
					callback.apply(loader, args);
				});

			}
		}
	}

    this.preload = function(){

        //----load components ---

        var Component = require('./component');

        Component.prototype = this;
        this.getDirs(this.COMPONENTS_PATH).forEach(function(option){

            var AdminComponent = require('./admin_component');

            loader._options[option] = new Component(option);
            
            if(option != 'admin'){
                AdminComponent.prototype = loader._options[option];
                loader._options['admin.'+option] = new AdminComponent();
            }else{
                AdminComponent.prototype = loader._options[option];
                loader._options[option] = new AdminComponent();
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



	    //--- load modules ----

		var Module = require('./module');
	    Module.prototype = this;
	    this.getDirs(this.MODULES_PATH).forEach(function(module){
			var submodules = loader.getDirs(loader.MODULES_PATH + loader.SEPARATOR + module);

		    loader._modules[module] = new Module(module);
		    
		    if(submodules.length){
			    submodules.forEach(function(submodule){
				    loader._modules[module].addSubmodule(submodule);
			    });
		    }

	    });

		//----- load plugins ----

	    this.getDirs(this.PLUGINS_PATH).forEach(function(event){

		    loader._plugins[event] = {};

		    loader.getFiles(loader.PLUGINS_PATH + loader.SEPARATOR + event).forEach(function(plugin){
			    var Item = require(loader.PLUGINS_PATH + loader.SEPARATOR + event + loader.SEPARATOR + plugin);
			    Item.prototype = loader;
			    loader._plugins[event][plugin] = new Item;
		    });
	    });


        this.preloadDB();
    }

    this.preloadTemplates = function(){

        for(var option in this._options){

            if(this._options[option].isAdmin() && option != 'admin')continue;
            
            var compare = this.getCompare(this._options[option].VIEW_PATH,'admin');

//            var tmpl_compare = this.getCompare(this.TEMPLATE_PATH + this.SEPARATOR + 'components' + this.SEPARATOR + option);
            var tmpl_compare = this.getCompare(this.TEMPLATE_PATH + this.SEPARATOR + option);

			if(!tmpl_compare.isEmpty()){
				for(var tmpl_key in tmpl_compare){
					compare[tmpl_key] = tmpl_compare[tmpl_key];
				}
			}

            if(!compare.isEmpty()){
                this._templates[option] = {};
                for(var key in compare){
                    this._templates[option][key] = fs.readFileSync(compare[key],'utf8');
                }
            }else{
                this._templates[option] = null;
            }

            var admin_compare = this.getCompare(this._options[option].VIEW_PATH + this.SEPARATOR + this.ADMIN_TEMPLATE);

            var admin_tmpl_compare = this.getCompare(this.ADMIN_TEMPLATE_PATH + this.SEPARATOR + 'components' + this.SEPARATOR + option);

            admin_compare.defaults(admin_tmpl_compare);

            if(!admin_compare.isEmpty()){
                this._admin_templates[option] = {};
                for(var key in admin_compare){
                    this._admin_templates[option][key] = fs.readFileSync(admin_compare[key],'utf8');
                }
            }else{
                this._admin_templates[option] = null;
            }

        }



        var template_compare = this.getCompare(this.TEMPLATE_PATH,'components');
        if(!template_compare.isEmpty()){
            for(var key in template_compare){
                if(!!this._templates[key]){
                    throw new Error('view '+template_compare[key]+' cant named as component');
                }else{
                    this._templates[key] = fs.readFileSync(template_compare[key],'utf8');
                }
            }
        }

        var admin_template_compare = this.getCompare(this.ADMIN_TEMPLATE_PATH,'components');
        
        if(!template_compare.isEmpty()){
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
		if(!this.fileExists(path))return false;
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

    this.query = function(req,res){
        var query = require('./url');
		query.prototype = this;
        return new query(req,res);
    }

    this.router = function(){

        if(!!this._router)return this._router;

        var router = require('./router');
        router.prototype = this;
        this._router = new router();
        return this._router;
    }

    this.routes = function(){
	    if(this._router_init)
	        return this._routes;
        //----load main routes ----

	    this._router_init = true;
        var routes = (fs.existsSync(this.APP_PATH + this.SEPARATOR + 'routes' + this.EXT_JSON)) ? require(this.APP_PATH + this.SEPARATOR + 'routes' + this.EXT_JSON) : {};

        for(key in routes){
            var route = Susanin.Route('/'+key);
            route.executor = routes[key];
	        this.addRoute(route);
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
	
	this.addRoute = function(route){
		if(route instanceof Susanin.Route){
			this._routes.push(route);
		}
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
