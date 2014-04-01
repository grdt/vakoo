var AdminComponent = function(name){

    var component = this;

    this.VIEW_PATH = this.COMPONENT_PATH + this.SEPARATOR + 'views' + this.SEPARATOR + 'admin';

    this.CONTROLLER_PATH = this.COMPONENT_PATH + this.SEPARATOR + 'controllers' + this.SEPARATOR + 'admin';

    this.user = function(callback){
        console.log('here now');
        if(this.session('user_id')){
            if(typeof this._options['user'] != "undefined"){
                var user = this._options['user'].model('user');
                if(!!user){
                    user.where({_id:this.session('user_id')});
                    user.findOne(function(){
                        if(typeof callback != "undefined"){
                            callback(user);
                        }
                    });
                }
            }else{
                if(typeof callback != "undefined"){
                    callback(null);
                }
            }
        }else{
            if(typeof callback != "undefined"){
                callback(null);
            }
        }
    }

    this.preload();

    return this;
}


module.exports = AdminComponent;