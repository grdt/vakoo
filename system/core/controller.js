var Controller = function(url){

    var _this = this;

    this.url = url;

    this.index = function(){

    }

    this.where = function(){
        this.url.response.send(this.url.executor);
    }

    this.run = function(method){
        if(typeof this[method] == "function"){
            this[method]();
        }else{
            this.show404(404,'method not found',this.url.response);
        }
    }

    return this;
}


module.exports = Controller;