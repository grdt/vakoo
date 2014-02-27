var user = function(){

    var _this = this;

    this.index = function(){
        this.where();
    }

    this.register = function(){
        var User = this.load.model('user');
        var user = new User();
        user.name = 'pasa';
        user.email = 'a@pasa.me';
        user.save(function(){
            this._app.controller.send(user.clean());
        });
//        this.send(user);
//        this.where();
    }

    return this;
}

module.exports = user;