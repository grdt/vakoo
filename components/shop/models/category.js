var Category = function(){

	this.COLLECTION_NAME = 'categories';

	this._id = '';

	this.title = '';

	this.ancestors = [];

	this.parent = '';

	this.import = {
		id:0,
		parent_id:0
	}

	this.createId = function(){
		this._id = translit(this.title);
		return this;
	}

	this.url = function(){
		var url = '/'+ ((this.ancestors.length) ? this.ancestors.join('/') + '/' : '') + this._id;
		return url;
	}
}

module.exports = Category;