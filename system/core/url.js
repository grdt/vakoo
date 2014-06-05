var Url = function(request,response){

    this.request = request;

    this.response = response;

    this.executor = this.router().parseExecutor(request);
    
    this.error = false;

    if(this.request.url != '/' && this.executor.isEqual(this.vakoo.config().default_executor)){
        var params = this.router().fetchUrl(this.request.url);
        if(!params.params && !params.executor){
            this.executor = this.router().executor(404);
        }else{
            this.executor = params.executor.defaults(this.vakoo.config().default_executor);
            this.request.params = params.params;
        }
    }

	this.initPlugin('query',request,response);

    return this;
}



module.exports = Url;