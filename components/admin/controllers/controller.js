var Controller = function(){

    var controller = this;

    this.index = function(){
        this.user(function(user){
            if(user){
                if(!controller.isEqual(controller.executor(),controller.router().executor())){
                    controller.exec(controller.executor());
                }else{
                    controller.render('main');
                }
            }else{
                if(!controller.executor().isEqual(controller.router().executor()) && !controller.executor().isEqual(controller.loginExecutor())){
                    controller.session('redirect_after_login',controller.url.request.url);
                    controller.redirect();
                }else{
                    controller.exec({option:'user',method:'login'});
                }
            }
        });
    }

    this.exec = function(executor){
        executor = this.router().executor(executor);
        var option = this.option('admin.' + executor.option);
        var controller = option.controller(executor.controller,this.url);
        controller.run(executor.method);
    }
    
    this.executor = function(){

        var executor = this.router().executor();

        if(this.get('task')){
            var task = this.get('task').split('.');
            executor.method = task[task.length - 1];
            if(task.length == 2){
                executor.controller = task[0];
            }
        }else{
            if(this.get('method')){
                executor.method = this.get('method');
            }
        }

        if(this.get('option')){
            executor.option = this.get('option');
        }

        if(this.get('method')){
            executor.method = this.get('method');
        }
        
        executor = this.router().executor(executor);

        return executor;
    }

    this.loginExecutor = function(){
        return {option:'user',controller:this.router().executor().controller,method:'login'};
    }

    return this;
}


module.exports = Controller;