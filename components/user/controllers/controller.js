var Controller = function(){

    var controller = this;

    this.register = function(){
        if(this.post()){
            var user = this.model('user');
            user.email = this.post('email');
            user.password = this.post('password');
            user.save(function(){
                if(user._id){
                    controller.redirect(controller.createUrl({method:'profile',json:'true'}));
                }
            })
        }else{
            this.render('register');
        }
    }

    this.profile = function(){
        this.where();
    }

    return this;
}


module.exports = Controller;