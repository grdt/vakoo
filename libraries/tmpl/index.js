var Handlebars = require('handlebars');

var Tmpl = function(params){

    if(!!params.url){
        this.url = params.url;
    }

    if(!!params.from){
        this.from = params.from;
    }


    this.render = function(view,data){
        var html = this.template(view);
        var layout = this.layout();

        if(html != null){

			var content = this.compile(this.template(view),data);
            var layout = this.layout(data);

            this.url.response.send(layout);
        }else{
            this.url.response.send('template '+view+' not found');
        }
    }

    this.compile = function(html,data){
        var template = Handlebars.compile(html);
        return template(data);
    }
    
    this.template = function(name){
        return this.from.template(name);
    }

    this.layout = function(data){
        var templates_destination = (this.from.isAdmin()) ? this._admin_templates : this._templates;
        if(!!templates_destination.layout){
            var lay = Handlebars.compile(templates_destination.layout);
            return lay({factory:this.factory(data)});
        }else{
            throw new Error('layout not found');
        }
    }

    this.factory = function(data){
        var factory = require('./factory');
        factory.prototype = this;
        return new factory(data);
    }

    this.preload = function(){

    }

    return this;

}

module.exports = Tmpl;