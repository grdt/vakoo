var Loader = require('./core/loader'),
    _ = require('underscore'),
    express = require('express'),
    fs = require('fs'),
    path = require('path'),
	multipart = require('connect-multiparty'),
	bodyParser = require('body-parser'),
	redis = require('redis');

require('./core/global');

/**
 * @class Vakoo
 */
var Vakoo = function(fastPort){

    var vakoo = this;

	var that = this;

	this.fastPort = fastPort;

    this.SEPARATOR = '/';
    this.SYSTEM_PATH = __dirname;
    this.APP_PATH = this.SYSTEM_PATH.replace('/system','');
    this.CONFIG_PATH = this.SYSTEM_PATH + this.SEPARATOR + 'config';
	this.PUBLIC_PATH = this.APP_PATH + this.SEPARATOR + 'public';

	this.ENVIRONMENT = process.env.NODE_ENV || "development";

    this.EXT_JS = '.js';
    this.EXT_JSON = '.json';

    this._express = express();

	this._server = require('http').createServer(this._express);

	this._global = {};

	this._isRunning = false;

	this.redis = false;

	this.isProduction = function(){
		return this.ENVIRONMENT === "production";
	}

	this.isDevelopment = function(){
		return this.ENVIRONMENT === "development";
	}

	this.global = function(variable, value){
		if(typeof value == "undefined"){
			return this._global[variable] || null;
		}else{
			if(typeof value === null){
				delete this._global[variable];
			}else{
				this._global[variable] = value;
			}
		}
	}

    this.start = function(){
		
		this.initRedis();
		
		this.middlewareInit();

	    this.executeInit();

        this.serverStart();
    };
	
	this.initRedis = function(){
		var redisClient = redis.createClient();
		
		redisClient.on("connect",function(){
			that.redis = redisClient;
		})
	}

	this.initLoader = function(){
		this.load = new Loader(this);
	}

	this.serverStop = function(){
		this._server.close();
		console.log('Vakoo stop listen');
	}

	this.serverStart = function(){
		var port = this.fastPort || this.config().port;
		this._server.listen(port);
		this.enableSmtp();
		this._isRunning = true;
		console.log('Vakoo start at port ',port, "env:",this.ENVIRONMENT);
	}

	this.serverRestart = function(){
		this.serverStop();
		this.serverStart();
	}

	this.middlewareInit = function(mw){
		if(typeof mw == "undefined")
			mw = this.middleware();

		for(var key in mw){
			this._express.use(mw[key].handler);
		}
	}

	this.expressInit = function(){
		this._express = require('express')();
	}

	this.serverInit = function(){
		this._server = require('http').createServer(this._express);
	}

	this.executeInit = function(){
		this._express.all('*',function(req,res){
			vakoo.load.execute(req,res);
		});
	}

	this.middleware = function(){

		if(typeof this._middleware != "undefined")
			return this._middleware;

		var mustHave = [
			{
				name:'json',
				handler:bodyParser.json()
			},
			{
				name:'url',
				handler:bodyParser.urlencoded({extended: true})
			},
			{
				name:'cookie',
				handler:express.cookieParser()
			},
			{
				name:'multipart',
				handler:multipart({uploadDir:this.APP_PATH + '/tmp'})
			},
			{
				name:'public',
				handler:express.static(this.PUBLIC_PATH)
			},
			{
				name:'yandex',
				handler:express.static(this.PUBLIC_PATH + '/yandex')
			}
		];

		if(this.config().template != 'default'){
			mustHave.push({
				name:'template_public',
				handler:express.static(this.APP_PATH + '/templates/' + this.config().template +'/public')
			});
		}

		var middleWare = {
			development:[
				{
					name:'logger',
					handler:express.logger('dev')
				},
				{
					name:'error',
					handler:express.errorHandler()
				},
			],
			production:[
				{
					name:'error',
					handler:express.errorHandler()
				},
			]
		};

		this._middleware = (middleWare[this.ENVIRONMENT] || middleWare.development);

		mustHave.forEach(function(mw){
			that._middleware.push(mw);
		});

		return this._middleware;
	}

    this.config = function(){
        if(!!this._config)return this._config;

        var default_config = (fs.existsSync(this.CONFIG_PATH + this.SEPARATOR + 'config' + this.EXT_JSON)) ? require(this.CONFIG_PATH + this.SEPARATOR + 'config' + this.EXT_JSON) : false;
        var config = (fs.existsSync(this.APP_PATH + this.SEPARATOR + 'config' + this.EXT_JSON)) ? require(this.APP_PATH + this.SEPARATOR + 'config' + this.EXT_JSON) : false;
        if(config){
            config.defaults(default_config);
        }else{
            config = default_config;
        }

        this._config = config;

        return config;
    }

	this.enableSmtp = function(){
		console.log('enable smtp');
		var config = this.config().smtp || false;
		if(!config){
			console.log('smtp config not found');
			return;
		}

		var outgoingCfg = this.config().smtp.outgoing,
			smtp = require('simplesmtp'),
			client = smtp.createClientPool(outgoingCfg.port,outgoingCfg.host,outgoingCfg.options);

		this.smtp = client;

	}

	this.sendMail = function(to, subject, html){
		var mail = this.load.option('main').model('mail');

		mail.recepient = to;
		mail.body = html;
		mail.subject = subject;

		mail.save(function(){
			if(!that.smtp){
				mail.status = 'error';
				mail.message = 'smtp client not runned';
			}else{
				that.smtp.sendMail(mail.compose(),function(error,response){
					if(error){
						mail.status = 'error';
						mail.message = error;
					}else{
						mail.status = 'success';
						mail.message = response;
					}

					mail.save();

				});
			}
		});
	}


	var _memory = {};
	this.memory = function(name,value){
		if(typeof value == "undefined"){
			if(typeof _memory[name] == "undefined"){
				return null;
			}else{
				return _memory[name];
			}
		}else{
			_memory[name] = value;
			return true;
		}

	}

	this.initLoader();

    return this;
};


module.exports = Vakoo;