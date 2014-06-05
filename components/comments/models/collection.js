var Collection = function($c){

	this.COLLECTION_NAME = 'comments';

	this._id = '';

	this.type = 'collection';

	this.comments = [];

	this.count = 0;

	this.getComments = function(callback){
		$c.model('comment').where({_id:{$in:this.comments}}).order({date:-1}).find(function(comments){
			callback(comments);
		});
	}
	
	this.add = function(comment){
		if(comment instanceof require('./comment')){
			comment.collectionId = this._id;
			comment.save();
			this.comments.push(comment._id);
			this.count++;
			this.save();
			return true;
		}else{
			return false;
		}
	}

}


module.exports = Collection;