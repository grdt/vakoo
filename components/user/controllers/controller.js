var Controller = function(){

    this.register = function(){
        this.url.response.send({aza:'aza'});
    }

    return this;
}


module.exports = Controller;