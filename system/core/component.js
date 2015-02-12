/**
 * @class CoreComponent
 * @augments Loader
 */
var CoreComponent = function(name){

    var component = this;

    this.COMPONENT_NAME = name;
    this.COMPONENT_PATH = this.APP_PATH + this.SEPARATOR + 'components' + this.SEPARATOR + this.COMPONENT_NAME;

    this.CONFIG_PATH = this.COMPONENT_PATH + this.SEPARATOR + 'config' + this.EXT_JSON;
    this.ROUTES_PATH = this.COMPONENT_PATH + this.SEPARATOR + 'routes' + this.EXT_JSON;

    this.MODEL_PATH = this.COMPONENT_PATH + this.SEPARATOR + 'models';

    this.VIEW_PATH = this.COMPONENT_PATH + this.SEPARATOR + 'views';

    this.CONTROLLER_PATH = this.COMPONENT_PATH + this.SEPARATOR + 'controllers';

    this.INDEX_CONTROLLER_PATH = '';

    this.DB_WAIT_LOOPS = 20;

    this.DB_WAIT_INTERVAL = 300;

    this.DB_WAIT_OK = false;

    this._controllers = {};

    this._models = {};

    this._views = {};

    this.config = {};

	this._executiveController = null;

    this.execute = function(query){
        var controller = this.controller(query.executor.controller,query);
        if(controller){
            controller.run(query.executor.method);
        }else{
            this.show404(404,'controller not found',query.response);
        }
    }

    this.controller = function(name,query){
        if(!!this._controllers[name]){
            var c = new this._controllers[name]();
            c.query = query;
			if(typeof query != "undefined"){
				this._executiveController = c;
			}
            return c;
        }else{
            var path = this.CONTROLLER_PATH + this.SEPARATOR + name + ".coffee";
            if(fs.existsSync(path)){
                var Controller = require(path);
                Controller.prototype = this.coreController();
                var c = new Controller(query);
//                c = _.extend((new this.coreController()), c);
                c.query = query;
                if(typeof query != "undefined"){
                    this._executiveController = c;
                }
                return c;
            }
            return false;
        }
    }

    this.model = function(name,options){
        if(!!this._models[name]){
	        if(this._models[name].prototype.isEmpty()){
		        this._models[name].prototype = this.coreModel();
	        }
            var m = new this._models[name](options);
			m._keys = [];
			var keys = m.keys();
			for(var k in keys){
				if(keys[k][0] != '_' || keys[k] == '_id'){
					m._keys.push(keys[k]);
				}
			}
            return m;
        }else{
			if(this.COMPONENT_NAME != this.DEFAULT_COMPONENT){
				return this.option().model(name,options);
			}
            throw new Error('model ' + name + ' not found');
            return false;
        }
    }
    
    this.library = function(name,data){
        if(!!this._libraries[name]){
			var lib = new this._libraries[name](data);
            return lib;
        }else{
            throw new Error('library ' + name + ' not found');
            return false;
        }
    }
    
    this.template = function(name){
        var templates_destination = (this.isAdmin()) ? this._admin_templates : this._templates;

        if(!!templates_destination[this.COMPONENT_NAME] && typeof templates_destination[this.COMPONENT_NAME][name] != "undefined"){
            return templates_destination[this.COMPONENT_NAME][name];
        }

        if(typeof templates_destination[name] != "undefined"){
            return templates_destination[name];
        }

		var message = 'template <strong>&laquo;'+name+'&raquo;</strong> not found';
		var template = this._executiveController.tmpl().compile(templates_destination.error,{message:message});

		return template;
    }

	this.throw = function(message){
		var templates_destination = (this.isAdmin()) ? this._admin_templates : this._templates;
		var template = this._executiveController.tmpl().compile(templates_destination.error,{message:message});
		this._executiveController.json(template);
		return false;
	}

    this.isAdmin = function(){
        return false;
    }

    this.user = function(callback){
        if(this.session('user_id')){
            var user = this.option('user').model('user');
            if(!!user){
                user.where({_id:this.session('user_id')});
                user.findOne(function(){
                    if(typeof callback != "undefined"){
                        callback(user);
                    }
                });
            }
        }else{
            if(typeof callback != "undefined"){
                callback(null);
            }
        }
    }


    this.coreController = function(){
        var core_controller = require('./controller');
        core_controller.prototype = this;
        this._core_controller = new core_controller();
        return this._core_controller;
    }
    
    this.coreModel = function(){
//        if(typeof this._core_model != "undefined")
//            return this._code_model;

        var core_model;

        if(typeof this.db == "object" && typeof this.db.model == "object"){
            core_model = this.db.model;
        }else{
            core_model = {};
        }

        this._core_model = core_model;

        return this._core_model;
    }

    this.preloadController = function(name,path){
        var controller = require(path);
        controller.prototype = this.coreController();
        this._controllers[name] = controller;
        return this;
    }

    this.preloadModel = function(name,path,callback){
        var model = require(path);
        model.prototype = this.coreModel();
        this._models[name] = model;
	    if(typeof callback == "function"){
		    callback();
	    }
        return this;
    }

    this.preloadConfig = function(){
        if(this.fileExists(this.CONFIG_PATH)){
            this.config = require(this.CONFIG_PATH);
        }
    }

    this.preloadRoutes = function(){
        if(this.fileExists(this.ROUTES_PATH)){
            this._components_routes.push(require(this.ROUTES_PATH));
        }
    }

    this.preloadModels = function(){
        if(typeof component.db != "object"){
            var loop = 1;
            var dbInterval = setInterval(function(){
                if(loop == component.DB_WAIT_LOOPS){
                    component.preloadModels();
                    clearInterval(dbInterval);
                }else{
                    loop++;
                    if(typeof component.db == "object"){
                        clearInterval(dbInterval);
                        component.preloadModels();
                        return false;
                    }
                }
            },this.DB_WAIT_INTERVAL);
            return false;
        }

        if(this.fileExists(this.MODEL_PATH) && this.isDir(this.MODEL_PATH)){
	        var files = this.getFiles(this.MODEL_PATH);
            files.forEach(function(model_file,i){
                if(component.getExtension(component.MODEL_PATH + component.SEPARATOR + model_file) == component.EXT_JS){
	                if(i == (files.length - 1)){
		                component.preloadModel(model_file.replace(component.EXT_JS,''),(component.MODEL_PATH + component.SEPARATOR + model_file).replace(component.EXT_JS,''),function(){
							//todo kill timeout
							setTimeout(function(){
								component.initPlugin('after_' + component.COMPONENT_NAME + '_init');
							},300);
		                });
	                }else{
		                component.preloadModel(model_file.replace(component.EXT_JS,''),(component.MODEL_PATH + component.SEPARATOR + model_file).replace(component.EXT_JS,''));
	                }

                }
            });
        }
    }

    this.preload = function(){

        if(!this.isAdmin() && this.fileExists(this.COMPONENT_PATH + this.SEPARATOR + 'index' + this.EXT_JS)){
            this.INDEX_CONTROLLER_PATH = this.COMPONENT_PATH + this.SEPARATOR + 'index' + this.EXT_JS;
        }

        if(!this.isAdmin() && this.fileExists(this.COMPONENT_PATH + this.SEPARATOR + 'controller' + this.EXT_JS)){
            this.INDEX_CONTROLLER_PATH = this.COMPONENT_PATH + this.SEPARATOR + 'controller' + this.EXT_JS;
        }

        if(this.isDir(this.CONTROLLER_PATH)){

            if(this.fileExists(this.CONTROLLER_PATH + this.SEPARATOR + 'index' + this.EXT_JS)){
                this.INDEX_CONTROLLER_PATH = this.CONTROLLER_PATH + this.SEPARATOR + 'index' + this.EXT_JS;
            }

            if(this.fileExists(this.CONTROLLER_PATH + this.SEPARATOR + 'controller' + this.EXT_JS)){
                this.INDEX_CONTROLLER_PATH = this.CONTROLLER_PATH + this.SEPARATOR + 'controller' + this.EXT_JS;
            }

            var controllers = this.getFiles(this.CONTROLLER_PATH);
            
            for(var key in controllers){

                var controller = controllers[key];

                if(controller != ('controller' + this.EXT_JS) && controller != ('index' + this.EXT_JS)){
                    if(this.getExtension(this.CONTROLLER_PATH + this.SEPARATOR + controller) == this.EXT_JS){
                        this.preloadController(controller.replace(this.EXT_JS,''),(this.CONTROLLER_PATH + this.SEPARATOR + controller));
                    }
                }
            }

        }
        
        if(this.INDEX_CONTROLLER_PATH != '')
            this.preloadController('controller',this.INDEX_CONTROLLER_PATH);

        return this;
    }

    this.preload();
    this.preloadConfig();
    this.preloadRoutes();
    this.preloadModels();

    return this;
}


module.exports = CoreComponent;