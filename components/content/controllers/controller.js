/**
 * @extends CoreController
 * @constructor
 */
var ContentController = function(){

	var that = this;

	this.article = function(){
		this.where();
	}

	this.articles = function(){
		this.where();
	}

	this.news = function(){
		this.where();
	}

}


module.exports = ContentController;