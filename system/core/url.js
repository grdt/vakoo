var Url = function(request,response){

    this.request = request;

    this.response = response;

    this.executor = this.router().parseExecutor(request);
    
    this.error = false;

    if(this.request.url != '/' && this.executor == this.vakoo.config().default_executor){
        var params = this.router().fetchUrl(this.request.url);
        if(!params){
            this.executor = this.router().executor(404);
        }else{
            this.executor = this._.defaults(params.executor,this.vakoo.config().default_executor);
            this.request.params = params.params;
        }
    }

    return this;
}



module.exports = Url;