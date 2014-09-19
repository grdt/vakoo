var Url = require('url');

var Plugin = function(){
	var that = this;

	this.callback = false;

	const DEFAULT_CITY = 'www';

	const CHOOSE_CITY = 'choose';

	this.init = function(query,callback,next){

//		console.log(process.memoryUsage().heapUsed / 1024 / 1024);

		var cb = function(){
			if(typeof callback == "function"){
				callback(query,next);
			}else{
				if(that.callback && typeof that.callback == "function"){
					that.callback(query);
				}
			}
		}

		if(query.executor.option == 'admin' || query.request.xhr){
			if(typeof callback == "function"){
				callback(query,next);
			}else{
				if(that.callback && typeof that.callback == "function"){
					that.callback(query);
				}
			}
			return;
		}

		var ip = query.request.headers['x-forwarded-for'] || query.request.connection.remoteAddress;

		if(!query.getSubdomain() && !query.cookie('city')){

			this.option('shop').model('city').byIP(ip).findOne(function(city){
				if(city._id){
					query.response.redirect('http://' + city.alias + '.' + query.getHost(true) + query.requestUrl());
				}else{
					query.cookie('city',DEFAULT_CITY);
					query.response.redirect('http://' + DEFAULT_CITY + '.' + query.getHost(true) + query.requestUrl());
				}
			});
		}else{
			var subdomain = query.getSubdomain(),
				cookieCity = query.cookie('city');

			if(cookieCity && cookieCity != CHOOSE_CITY){
				this.option('shop').model('city').where({status:'active',alias:cookieCity}).findOne(function(city){
					if(city._id){
						if(subdomain == cookieCity){
							query.city = city.short();
							cb();
						}else{
							query.response.redirect('http://' + city.alias + '.' + query.getHost(true) + query.requestUrl());
						}
					}else{
						query.cookie('city',DEFAULT_CITY);
						if(subdomain != DEFAULT_CITY){
							query.response.redirect('http://' + DEFAULT_CITY + '.' + query.getHost(true) + query.requestUrl());
						}else{
							cb();
						}
					}
				});
			}else{
				this.option('shop').model('city').where({status:'active',alias:subdomain}).findOne(function(city){
					if(city._id){

						query.city = city.short();

						query.cookie('city',subdomain);

						cb();
					}else{
						if(subdomain != DEFAULT_CITY){
							that.option('shop').model('city').byIP(ip).findOne(function(city){
								if(city._id){
									query.cookie('city',city.alias);
									query.response.redirect('http://' + city.alias + '.' + query.getHost(true) + query.requestUrl());
								}else{
									query.cookie('city',CHOOSE_CITY);
									query.response.redirect('http://' + DEFAULT_CITY + '.' + query.getHost(true) + query.requestUrl());
								}
							});
						}else{
							query.cookie('city',CHOOSE_CITY);
							cb();
						}
					}
				});
			}
		}
	}
}

module.exports = Plugin;