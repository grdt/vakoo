var Url = require('url');

var Plugin = function(){
	var $p = this;

	this.callback = false;

	this.init = function(response,request,callback,next){
		
//		this.option('shop').model('city').find(function(cities){
//			cities.forEach(function(city){
//				$p.option('shop').model('city').where({alias:city.alias,_id:{$ne:city._id}}).find(function(duplicates){
//					if(duplicates.length){
//						console.log(city.alias,duplicates.length);
//					}
//				});
//			})
//		});
		
		if(typeof callback == "function"){
			callback(response,request,next);
		}else{
			if(this.callback && typeof this.callback == "function"){
				this.callback(response,request);
			}
		}

	}
}

module.exports = Plugin;