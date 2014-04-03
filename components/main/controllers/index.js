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
        var obj = {
            aza:'olo'
        };

        var arr = ['aza','olo']

//        require(this.SYSTEM_PATH + this.SEPARATOR + 'core/global');
//        sameGlobalFunc('aza');

//        obj.azazaFunc('aza');
//        arr.sameObjectFunc('arr');
        
        this.where();
	}

    return this;
}


module.exports = Controller;