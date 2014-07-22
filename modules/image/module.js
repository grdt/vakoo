/**
 * @constructor
 */
var ImageModule = function(){

	this.render = function(factory,data,options){
		return {view:'modules.image',data:{image:options}};
	}
}

module.exports = ImageModule;