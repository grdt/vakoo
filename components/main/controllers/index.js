var Controller = function(){

    this.register = function(){
        this.url.response.send({aza:'aza'});
    }

    this.page = function(){
        this.where();
    }

    return this;
}


module.exports = Controller;