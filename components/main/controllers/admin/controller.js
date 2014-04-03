var Controller = function(){

    var MainController = this;

    this.page = function(){
        var page = this.model('page');
        console.log(this.session());
        this.where();

    }

    this.index = function() {
        this.where();
    }

    return this;
}


module.exports = Controller;