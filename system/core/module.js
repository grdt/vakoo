var Module = function(name){

	this._submodules = {};

	this._module = false;

	this.MODULE_PATH = this.MODULES_PATH + this.SEPARATOR + name;
	
	if(this.fileExists(this.MODULE_PATH + this.SEPARATOR + 'module.js')){
		var Module = require(this.MODULE_PATH + this.SEPARATOR + 'module.js');
		Module.prototype = this;
		this._module = new Module();
	}

	this.addSubmodule = function(module){
		var Module = require(this.MODULE_PATH + this.SEPARATOR + module + this.SEPARATOR + 'module.js');
		Module.prototype = this;
		var submodule = new Module();
		submodule.MODULE_PATH = this.MODULE_PATH + this.SEPARATOR + module;
		this._submodules[module] = submodule;
	}

	this.submodule = function(name){
		if(!!this._submodules[name]){
			var submodule = this._submodules[name];
			return submodule;
		}else{
			return false;
		}
	}


}

module.exports = Module;