var Controller = function(){

    var MainController = this;

    this.register = function(){
        this.url.response.send({aza:'aza'});
    }

    this.page = function(){
        var page = this.model('page');

        this.render('page',page);

    }

	this.index = function() {
        this.where();
	}

    return this;
}


module.exports = Controller;