var Router = function(){

    this.parseExecutor = function(req){

        var executor = this._.clone(this.vakoo.config().default_executor);
        
        if(typeof req.param('task') != "undefined"){
            var task = req.param('task').split('.');
            executor.method = task[task.length - 1];
            if(task.length == 2){
                executor.controller = task[0];
            }
        }

        if(typeof req.param('option') != "undefined"){
            executor.option = req.param('option');
        }

        return executor;

    }

    this.fetchUrl = function(url){
        var params = false;
        var executor = false;
        this.routes().forEach(function(route){
            if(!params && route.match(url)){

                params = route.match(url);

                executor = route.executor;

                for(i in route.executor){
                    if(route.executor[i][0] == ':'){
                        if(i == 'method' || i == 'option' || i == 'controller'){
                            executor[i] = params[i];
                        }
                    }else{
                        params[i] = executor[i];
                    }
                }

                //todo break foreach
            }
        });

        return {params:params,executor:executor};
    }

    this.executor = function(code){
        if(typeof code == "undefined"){
            code = 404;
        }

        var codes = {
            404:{option:"main",controller:"controller",method:"show404"},
            666:{option:"main",controller:"controller",method:"show666"}
        };

        if(typeof codes[code] != "undefined"){
            return codes[code];
        }else{
            return codes[666];
        }
    }

    return this;

}


module.exports = Router;