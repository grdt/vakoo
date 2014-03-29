var Controller = function(){

    this.register = function(){
        this.url.response.send({aza:'aza'});
    }

    this.index = function(){
        this.where();
    }

    this.page = function(){
        var page = this.model('page');

        this.where();
    }

	this.index = function() {
		this.where()
	}

    return this;
}


module.exports = Controller;