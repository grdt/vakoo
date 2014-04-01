var Tmpl = function(params){

    if(!!params.url){
        this.url = params.url;
    }

    if(!!params.option){
        this.option = params.option;
    }


    this.render = function(view,data){
        console.log(this.LIBRARY_NAME);
        console.log(this.LIBRARY_PATH);
        console.log('render view: ',view,'with data: ',data);
        var template = this.template(view);

        if(template != null){
            this.url.response.send(template + '1');
        }else{
            this.url.response.send('template '+view+' not found');
        }
    }
    
    this.template = function(name){
        if(typeof this._templates[this.option.COMPONENT_NAME][name] != "undefined"){
            return this._templates[this.option.COMPONENT_NAME][name];
        }

        if(typeof this._templates[name] != "undefined"){
            return this._templates[name];
        }

        return null;
    }

    this.preload = function(){

    }

    return this;

}

module.exports = Tmpl;