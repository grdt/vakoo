var Controller = function(){

    var $c = this;

    this.register = function(){
        this.url.response.send({aza:'aza'});
    }

    this.page = function(){
        var page = this.model('page');

        this.render('page', {page: page});

    }

	this.index = function() {
		this.tmpl().display('main_page',{
			title:'vakoo page title',
			zaz:'olo',
			aza:'lol'
		});
	}

	this.error = function(){
		this.echo('error page. code: ' + this.get('id'));
	}

    return this;
}


module.exports = Controller;