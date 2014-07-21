/**
 * @param name
 * @constructor
 * @extends CoreComponent
 */
var CoreAdminComponent = function(name){

    var component = this;

    this.VIEW_PATH = this.COMPONENT_PATH + this.SEPARATOR + 'views' + this.SEPARATOR + 'admin';

    this.CONTROLLER_PATH = this.COMPONENT_PATH + this.SEPARATOR + 'controllers' + this.SEPARATOR + 'admin';

    if(this.COMPONENT_NAME == 'admin'){
        this.VIEW_PATH = this.COMPONENT_PATH + this.SEPARATOR + 'views';
        this.CONTROLLER_PATH = this.COMPONENT_PATH + this.SEPARATOR + 'controllers';
    }

    this.INDEX_CONTROLLER_PATH = '';

    if(!!this._controllers){
        this._controllers = {};
    }

    this.user = function(callback){
        if(this.session('user_id')){
            var user = this.option('user').model('user');
            if(!!user){
                user.where({_id:this.session('user_id')});
                user.findOne(function(){
                    if(typeof callback != "undefined"){
                        if(user.status == 'admin'){
                            callback(user);
                        }else{
                            callback(null);
                        }
                    }
                });
            }
        }else{
            if(typeof callback != "undefined"){
                callback(null);
            }
        }
    }

    this.isAdmin = function(){
        return true;
    }

    this.preload();
}


module.exports = CoreAdminComponent;