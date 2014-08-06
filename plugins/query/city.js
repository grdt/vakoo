var Url = require('url');

var Plugin = function(){
	var that = this;

	this.callback = false;

	const DEFAULT_CITY = 'www';

	this.init = function(query,callback,next){

		if(!query.getSubdomain()){

			var ip = query.request.headers['x-forwarded-for'] || query.request.connection.remoteAddress;

			this.option('shop').model('city').byIP(ip).findOne(function(city){
				if(city._id){
					query.response.redirect('http://' + city.alias + '.' + query.getHost(true) + query.requestUrl());
				}else{
					query.response.redirect('http://' + DEFAULT_CITY + '.' + query.getHost(true) + query.requestUrl());
				}
			});
			return;
		}else{
			var subdomain = query.getSubdomain();
			this.option('shop').model('city').where({status:'active',alias:subdomain}).findOne(function(city){
				if(city._id){

					query.city = city.short();

					if(typeof callback == "function"){
						callback(query,next);
					}else{
						if(that.callback && typeof that.callback == "function"){
							that.callback(query);
						}
					}
				}else{
					if(subdomain != DEFAULT_CITY){
						query.response.redirect('http://' + DEFAULT_CITY + '.' + query.getHost(true) + query.requestUrl());
					}else{
						if(typeof callback == "function"){
							callback(query,next);
						}else{
							if(that.callback && typeof that.callback == "function"){
								that.callback(query);
							}
						}
					}
				}
			});
			return;
		}

	}
}

module.exports = Plugin;