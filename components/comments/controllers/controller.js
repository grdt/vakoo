var url = require('url');

var Controller = function(){
	
	var self = this;
	
	this.list = function(destination){
		if(typeof destination == "undefined"){
			var parseUrl = url.parse(this.get('url'));
			var destination = parseUrl.path;
		}
		
		this.model('collection',this).where({_id:destination}).findOne(function(collection){
			if(!collection._id){
				collection._id = destination;
				collection.insert();
			}

			collection.getComments(function(comments){
				if(self.isAjax()){
					self.tmpl().render('modules.comments-list',{collection:collection,comments:comments});
				}
			});
		});
		
	}

	this.add = function(){
		if(this.post()){
			var parseUrl = url.parse(this.post('url'));
			var destination = parseUrl.path;
			var comment = self.model('comment');
			
			comment.author = this.post('name');
			comment.body = this.post('body');
			if(!comment.body){
				this.list(destination);
				return;
			}
			comment.save(function(){
				self.model('collection',self).where({_id:destination}).findOne(function(collection){
					if(!collection._id){
						collection._id = destination;
						collection.insert();
					}
					collection.add(comment);
					self.list(destination);
				});
			});
		}
	}
}

module.exports = Controller;