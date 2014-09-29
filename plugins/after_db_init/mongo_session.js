var express = require('express');

var Plugin = function(){
	var $p = this;

	this.init = function(){

		if(!this.vakoo._isRunning)
			return;

		this.vakoo.serverStop();

		this.vakoo.expressInit();

		var middleware = this.vakoo.middleware();

		var handler;

		var MongoStore = require('connect-mongo')(express);

		var added = false;

		for(key in middleware){
			if(middleware[key].name == 'session'){
				middleware[key].handler = express.session({
					store:new MongoStore({url:'mongodb://' + this.vakoo.config().db.host + ':27017' + this.SEPARATOR + this.vakoo.config().db.database}),
					secret:'vakoosecretkey',
					key:"vakoo.sid",
					cookie  : {
						maxAge  : new Date(Date.now() + this.vakoo.config().session_live),
						domain: 'vakoo.ru'
					}
				});

				added = true;
			}
		}

		if(!added){
			middleware.push({
				name:'session',
				handler:express.session({
					store:new MongoStore({url:'mongodb://' + this.vakoo.config().db.host + ':27017' + this.SEPARATOR + this.vakoo.config().db.database}),
					secret:'vakoosecretkey',
					key:"vakoo.sid",
					cookie  : {
						maxAge  : new Date(Date.now() + this.vakoo.config().session_live),
						domain: this.vakoo.config().domain
					}
				})
			});
			
			console.log('enable mongo session');
		}

		this.vakoo.middlewareInit(middleware);
		this.vakoo.executeInit();
		this.vakoo.serverInit();
		this.vakoo.serverStart();
	}

}

module.exports = Plugin;