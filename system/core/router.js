var _url = require('url');

var Router = function(){

    var router = this;

    this.parseExecutor = function(req){

        var executor = this.executor();

        if(_url.parse(req.url).pathname != '/'){
            return executor;
        }
        
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

                executor = route.executor.clone();

                for(i in route.executor){
                    if(route.executor[i][0] == ':'){
                        if(i == 'method' || i == 'option' || i == 'controller'){
                            executor[i] = params[i];
                        }
                    }else{
                        if(i != 'method' && i != 'option' && i != 'controller'){
                            params[i] = executor[i];
                        }
                    }
                }

                //todo break foreach
            }
        });

        return {params:params,executor:executor};
    }
    
    this.createUrl = function(params){

        params = this.executor(params);

        var executor = params.pick(['option','controller','method']);

        var url = false;
        
        this.routes().forEach(function(route){
            var r_ex = router.executor(route.executor);
            if(!url && r_ex.option == executor.option){
                if(r_ex.controller == executor.controller){
                    if(r_ex.method == executor.method){
                        url = route.buildUrl(params);
                    }else{
                        if(r_ex.method[0] == ':'){
                            url = route.buildUrl(params);
                        }
                    }
                }else{
                    if(r_ex.controller[0] == ':'){
                        if(r_ex.method == executor.method){
                            url = route.buildUrl(params);
                        }else{
                            if(r_ex.method[0] == ':'){
                                url = route.buildUrl(params);
                            }
                        }
                    }
                }
            }
        });

        return url;
    }

    this.executor = function(executor){
        var clone = this.vakoo.config().default_executor.clone();
        if(typeof executor == "undefined"){
            return clone;
        }else{
	        if(_.isNumber(executor)){
		        return {
			        option:"main",
			        controller:"controller",
			        method:"error",
			        id:executor
		        }
	        }
            return executor.defaults(clone);
        }
    }

    return this;

}


module.exports = Router;