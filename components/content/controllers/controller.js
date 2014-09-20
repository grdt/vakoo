/**
 * @extends CoreController
 * @constructor
 */
var ContentController = function(){

	var that = this;

	this.index = function(){
//		this.model('page').where({_id:this.get('id')}).findOne(function(page){
//			that.tmpl().display('page',{title:page.title,page:page,meta:page.meta,partial:{city:that.query.city}});
//		});
	}

	this.article = function(){
		this.model('page').where({_id:this.get('id')}).findOne(function(page){
			that.model('page').where({_id:{$ne:that.model('page').ObjectID(that.get('id'))},alias:{$nin:['main','contacts']}}).find(function(pages){
				that.tmpl().display('page',{
					title:page.meta.title,
					page:page,
					meta:page.meta,
					partial:{city:that.query.city},
					related:pages
				});
			});

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