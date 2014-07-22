/**
 * @constructor
 * @extends CoreAdminController
 */
var FileIndexAdminController = function(){

	var that = this;

	this.upload = function(){
		if(this.file('vakooFile')){
			this.model('file').upload(this.file('vakooFile'),function(file){
				that.json(file.uploadResult());
			});

		}else{
			this.json({success:'false'});
		}
	}
}


module.exports = FileIndexAdminController;