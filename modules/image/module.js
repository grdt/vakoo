/**
 * @constructor
 */
var ImageModule = function(){

	this.render = function(factory,data,options,anonce,name){
		if(typeof anonce != "undefined"){
			options.anonce = anonce;
		}

		options.fileName = name || 'image';

		return {view:'modules.image',data:{image:options}};
	}
}

module.exports = ImageModule;