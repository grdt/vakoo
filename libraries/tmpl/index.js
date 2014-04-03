var Tmpl = function(params){

    if(!!params.url){
        this.url = params.url;
    }

    if(!!params.from){
        this.from = params.from;
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
        return this.from.template(name);
    }

    this.preload = function(){

    }

    return this;

}

module.exports = Tmpl;