var Controller = function(){

    var controller = this;

    this.login = function(){
        if(this.post()){
            var user = this.model('user');
            user.where({email:this.post('email'),password:this.post('password')});
            user.findOne(function(){
                if(user._id && user.status == 'admin'){
                    user.last_login = new Date();
                    user.save();
                    controller.session('user_id',user._id);
                    controller.redirect('/admin');
                }else{
                    controller.render('login');
                }
            })
        }else{
            this.user(function(user){
                if(user){
                    controller.redirect('/admin');
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