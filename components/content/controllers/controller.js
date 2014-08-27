/**
 * @extends CoreController
 * @constructor
 */
var ContentController = function(){

	var that = this;

	this.index = function(){
		this.model('page').where({_id:this.get('id')}).findOne(function(page){
			that.tmpl().display('page',{title:page.title,page:page,meta:page.meta,partial:{city:that.query.city}});
		});
	}

	this.article = function(){
		this.model('page').where({_id:this.get('id')}).findOne(function(page){
			that.tmpl().display('page',{title:page.title,page:page,meta:page.meta,partial:{city:that.query.city}});
		});
	}

	this.articles = function(){
		this.where();
	}

	this.news = function(){
		this.where();
	}

}


module.exports = ContentController;