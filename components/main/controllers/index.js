var Controller = function(){

    var that = this;

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

	
	this.feedback = function(){
		if(this.isAjax()){
			this.model('feedback').setAttributes(this.post()).save(function(){
				that.vakoo.sendMail(
					'a@pasa.me',
					'LUXYsexy Feedback',
					that.tmpl().render('feedback',that.post(),true)
				);
			});
			this.json({success:true});
		}
	}
	
    return this;
}


module.exports = Controller;