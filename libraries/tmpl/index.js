var Handlebars = require('handlebars');

var Tmpl = function(params){

    if(!!params.url){
        this.url = params.url;
    }

    if(!!params.from){
        this.from = params.from;
    }


    this.render = function(view,data){
//        console.log(this.LIBRARY_NAME);
//        console.log(this.LIBRARY_PATH);
//        console.log('render view: ',view,'with data: ',data);
        var html = this.template(view);
//		var layout = this._templates.layout;
//		html = layout
        if(html != null){
			var _this = this;
			Handlebars.registerHelper('include', function(fileName) {
				var file = view + '.' + fileName;
				var result = _this.template(file);
				return new Handlebars.SafeString(result);
			});

			var template = Handlebars.compile(html);
			var output = template(data.data);

            this.url.response.send(output);
        }else{
            this.url.response.send('template '+view+' not found');
        }
    }
    
    this.template = function(name){
        return this.from.template(name);
    }

    this.preload = function(){

    }

    return this;

}

module.exports = Tmpl;