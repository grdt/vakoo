/**
 * @constructor
 */
var ImageModule = function(){

	this.render = function(factory,input){

		var args = _.rest(input,2);

		var image = args[0];

		image.fileName = args[2] || 'image';
		image.anonce = args[1] || 'Изображение';


		return {view:'modules.image',data:{image:image}};
	}
}

module.exports = ImageModule;