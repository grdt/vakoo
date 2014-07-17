var Controller = function(){

    var controller = this;

    this.login = function(){
        if(this.post()){
            var user = this.model('user');
            user.where({email:this.post('email'),password:this.post('password')});
            user.findOne(function(user){
                if(user._id && user.status == 'admin'){
                    user.last_login = new Date();
                    user.save();
                    controller.session('user_id',user._id);
                    if(controller.session('redirect_after_login')){
                        controller.redirect(controller.session('redirect_after_login'));
                        controller.session('redirect_after_login',null);
                    }else{
                        controller.redirect();
                    }
                }else{
					//todo const errors
					controller.setFlash('error','Неправильный логин или пароль!');
                    controller.tmpl().layout('login').display('login');
                }
            })
        }else{
            this.user(function(user){
                if(user){
                    controller.redirect('/admin');
                }else{
					controller.tmpl().layout('login').display('login');
                }
            })
        }
    }

    this.logout = function(){
        this.destroySession();
        this.redirect();
    }

    return this;
}


module.exports = Controller;