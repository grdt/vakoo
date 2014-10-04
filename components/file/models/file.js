var crypto = require('crypto');
/**
 * @constructor
 * @extends {CoreModel}
 */
var FileModel = function(){

	var that = this;

	this.COLLECTION_NAME = 'files';

	const UPLOAD_PATH = '/public/files/';

	this._id = '';

	this.name = '';

	this.originalName = '';

	this.path = '';

	this.size = 0;

	this.type = '';

	this.added = new Date();

	this.finded = false;

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
		var date = new Date();
		var monthes = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		var loader = this.vakoo.load;

		var day = date.getDate();
		var month = monthes[date.getMonth()];
//		day = 7;
//		month = 'Sep';

		if(!loader.isDir(this.APP_PATH + UPLOAD_PATH + date.getFullYear() + month)){
			fs.mkdirSync(this.APP_PATH + UPLOAD_PATH + date.getFullYear() + month);
		}



		var path = date.getFullYear() + month + this.SEPARATOR + day;
		return path;
//		return this._id.clone().toString().substr(0,8);
	}

	this.loadFromSource = function(link, name, callback){
		var http = require('http');
		var fs = require('fs');
		var ext = link.split('.')[link.split('.').length - 1];
		var hash = this.getHash();
		var loader = this.vakoo.load;
		var path = this.APP_PATH + UPLOAD_PATH;
		path += hash;
		if(!loader.isDir(path)){
			fs.mkdirSync(path);
		}
		
		path += this.SEPARATOR + name + '.' + ext;

		var file = fs.createWriteStream(path);
		var request = http.get(link, function(response) {
			response.pipe(file);
			response.on('end',function(){
				that.name = name + '.' + ext;
				that.originalName = link.split('/')[link.split('/').length - 1];
				that.path = path.replace(that.APP_PATH,'').replace('/public','');
				that.size = fs.statSync(path).size;
				that.type = "image/jpeg";
				callback(that);
			});
			response.on('error',function(error){
				console.log(error);
			})
		});
	}

	this.short = function(alt){
		return {
			id:this._id,
			name:this.name,
			alt:alt,
			path:this.path
		}
	}

}

module.exports = FileModel;