var Controller = function(){

    var MainController = this;

    this.register = function(){
        this.url.response.send({aza:'aza'});
    }

    this.index = function(){
        this.where();
    }

    this.page = function(){
        var page = this.model('page');


        if(!this.post()){
            this.url.response.send('<form method="post" action="/about" enctype="multipart/form-data">'
                + '<p>Image: <input type="file" name="image" /></p>'
                + '<p>Image multiple: <input type="file" name="imagemulti" multiple/></p>'
                + '<p>text: <input type="text" name="text" value="text"/></p>'
                + '<p><input type="submit" value="Upload" /></p>'
                + '</form>');

            return false;
        }else{
            console.log(this.post());
            var image = this.files('image');
            var imagemulti = this.files('imagemulti');

            console.log(imagemulti);
            
        }


        this.where();
    }

	this.index = function() {
		this.where()
	}

    return this;
}


module.exports = Controller;