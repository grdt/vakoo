var crypto = require('crypto');
/**
 * @constructor
 * @extends {CoreModel}
 */
var FileFileModel = function(){

	this.COLLECTION_NAME = 'files';

	const UPLOAD_PATH = '/public/files/';


	this._id = '';

	this.name = '';

	this.originalName = '';

	this.path = '';

	this.size = 0;

	this.type = '';

	this.added = new Date();

	this.upload = function(fileObj, callback){
		var path = this.APP_PATH + UPLOAD_PATH;
		var loader = this.vakoo.load;
		this.size = fileObj.size;
		this.name = this.originalName = fileObj.name;
		this.type = fileObj.type;
		
		this.save(function(file){
			var hash = file.getHash();
			path += hash;
			if(!loader.isDir(path)){
				fs.mkdirSync(path);
			}
			file.path = UPLOAD_PATH.replace('/public','') + hash + this.SEPARATOR + file.originalName;
			if(!fs.writeFileSync(path + this.SEPARATOR + file.originalName, fs.readFileSync(fileObj.path))){
				file.save(function(file){
					callback(file);
				});
			}
		});
	}

	this.uploadResult = function(){
		return this.clean();
	}

	this.getHash = function(){
		return this._id.clone().toString().substr(0,8);
	}

}

module.exports = FileFileModel;