var Category = function(){

	this.COLLECTION_NAME = 'categories';

	this._id = '';

	this.title = '';

	this.ancestors = [];

	this.import = {
		id:0,
		parent_id:0
	}

	this.createId = function(){
		this._id = translit(this.title);
		return this;
	}
}

module.exports = Category;