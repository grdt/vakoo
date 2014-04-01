var Controller = function(){

    var controller = this;

    this.index = function(){

        this.user(function(user){
            console.log(user);
        });

        this.where();
    }

    return this;
}


module.exports = Controller;