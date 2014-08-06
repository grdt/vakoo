var url = require('url'),
	querystring = require('querystring');

/**
 * @class Query
 * @extends Loader
 */
var Query = function(request,response){
	
	var that = this;

    this.request = request;

    this.response = response;

    this.executor = this.router().parseExecutor(request);
    
    this.error = false;

	this.city = false;

    if(this.request.url != '/' && this.executor.isEqual(this.vakoo.config().default_executor)){
        var params = this.router().fetchUrl(this.request.url);
        if(!params.params && !params.executor){
            this.executor = this.router().executor(404);
        }else{
            this.executor = params.executor.defaults(this.vakoo.config().default_executor);
            this.request.params = params.params;
        }
    }

	this.requestUrl = function(){
		return this.request.url;
	}

	this.referrer = function(){
		var ref = this.request.headers.referer;
		if(!ref)return false;
		var parsed = url.parse(ref);
		var headers = this.request.headers;

		if(parsed.hostname == headers.host){
			return parsed.path;
		}else{
			return ref;
		}
	}

	this.getHost = function(domain){
		if(typeof domain != "undefined" && domain == true){
			var host = this.request.headers.host,
				splitted = host.split('.');

			return splitted.splice(splitted.length - 2,splitted.length).join('.');
		}
		return this.request.headers.host;
	}

	this.getSubdomain = function(){
		var host = this.request.headers.host,
			splitted = host.split('.');

		if(splitted.length == 2){
			return false;
		}else if(splitted.length == 3){
			return splitted[0];
		}else{
			return splitted.splice(0,splitted.length - 2).join('.');
		}
	}

	this.mergeUrl = function(from, needle){
		var parsedFrom = url.parse(from),
			queryFrom = parsedFrom.query,
			pathFrom = parsedFrom.pathname,
			objQueryFrom = querystring.parse(queryFrom);
		return pathFrom + '?' + querystring.stringify(objQueryFrom.defaults(needle));
	}
}



module.exports = Query;