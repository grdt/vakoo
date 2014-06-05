var Comment = function(){

	this.COLLECTION_NAME = 'comments';

	this._id = '';

	this.collectionId = '';

	this.type = 'comment';

	this.author = '';

	this.body = '';

	this.rating = {
		value:null,
		votes:[],
		up:0,
		down:0
	};

	this.guest = true;

	this.date = new Date();
}


module.exports = Comment;