/**
 * @constructor
 * @extends CoreAdminController
 */
var AdminController = function(){

    var controller = this,
		that = this;

    this.index = function(){
        this.user(function(user){
            if(user){
                if(!controller.executor().isEqual(controller.router().executor())){
                    controller.exec(controller.executor());
                }else{
                    controller.tmpl().display('main');
                }
            }else{
				if(that.isAjax()){
					that.json({success:false});
					return;
				}
                if(!controller.executor().isEqual(controller.router().executor()) && !controller.executor().isEqual(controller.loginExecutor())){
                    controller.session('redirect_after_login',controller.query.request.url);
					if(controller.executor().isEqual({option:'admin',controller:'controller',method:'index'})){
						controller.exec({option:'user',method:'login'});
					}else{
						controller.redirect();
					}
                }else{
                    controller.exec({option:'user',method:'login'});
                }
            }
        });
    }

    this.exec = function(executor){
        executor = this.router().executor(executor);
        var option = this.option('admin.' + executor.option);
        var controller = option.controller(executor.controller,this.query);
		if(controller){
			controller.run(executor.method);
		}else{
			this.echo('controller not found')
		}

    }
    
    this.executor = function(){
		//todo refactoring
        var executor = this.router().executor();

        if(this.get('task')){
            var task = this.get('task').split('.');
            executor.method = task[task.length - 1];
            if(task.length == 2){
                executor.option = task[0];

				var subtask = task[1].split('/');

				if(subtask.length == 2){
					executor.controller = subtask[0];
					executor.method = subtask[1];
				}
            }
        }else{
            if(this.get('method')){
                executor.method = this.get('method');
            }
        }
        
        executor = this.router().executor(executor);

        return executor;
    }

    this.loginExecutor = function(){
        return {option:'user',controller:this.router().executor().controller,method:'login'};
    }

    return this;
}


module.exports = AdminController;