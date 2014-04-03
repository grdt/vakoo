var Controller = function(){

    var controller = this;

    this.index = function(){

        this.user(function(user){
            if(user){
                if(!controller._.isEqual(controller.executor(),controller.router().executor())){
                    controller.exec(controller.executor());
                }else{
                    controller.render('main');
                }
            }else{
                controller.exec({option:'user',method:'login'});
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
        }
        
        executor = this.router().executor(executor);

        return executor;
    }

    return this;
}


module.exports = Controller;