var Controller = function(){

	var $c = this;

	this.index = function(){
		this.tmpl().display('main');
	}

}


module.exports = Controller;