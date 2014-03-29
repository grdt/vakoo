var Controller = function(){

    this.register = function(){
        var page = this.model('page');
        this.where();
    }

    return this;
}


module.exports = Controller;