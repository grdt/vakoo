var Controller = function(){

    var controller = this;

    this.register = function(){
        if(this.post()){
            var user = this.model('user');
            user.email = this.post('email');
            user.password = this.post('password');
            user.save(function(){
                if(user._id){
                    controller.redirect(controller.createUrl({method:'profile'}));
                }
            })
        }else{
            this.render('register');
        }
    }

    this.profile = function(){

        this.user(function(user){
            if(user){
                controller.json(user.clean());
            }else{
                controller.session('redirect_after_login',controller.url.request.url);
                controller.redirect(controller.createUrl({method:'login'}));
            }
        })
    }

    this.login = function(){
        if(this.post()){
            var user = this.model('user');
            user.where({email:this.post('email'),password:this.post('password')});
            user.findOne(function(){
                if(user._id){
                    user.last_login = new Date();
                    user.save();
                    controller.session('user_id',user._id);
                    if(controller.session('redirect_after_login')){
                        controller.redirect(controller.session('redirect_after_login'));
                        controller.session('redirect_after_login',null);
                    }else{
                        controller.redirect(controller.createUrl({method:'profile'}));
                    }
                }else{
                    controller.render('login');
                }
            })
        }else{
            this.user(function(user){
                if(user){
                    controller.redirect(controller.createUrl({method:'profile'}));
                }else{
                    controller.render('login');
                }
            })
        }
    }

    this.logout = function(){
        this.session('user_id',null);
        this.redirect();
    }

    return this;
}


module.exports = Controller;