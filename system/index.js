var Loader = require('./core/loader'),
    _ = require('underscore'),
    express = require('express'),
    fs = require('fs'),
    path = require('path'),
	multipart = require('connect-multiparty');

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

	this.ENVIRONMENT = process.env.NODE_ENV;

    this.EXT_JS = '.js';
    this.EXT_JSON = '.json';

    this._express = express();

	this._server = require('http').createServer(this._express);

    this.start = function(){

        this.load = new Loader(this);

		this.middlewareInit();

	    this.executeInit();

        this.serverStart();
    };

	this.serverStop = function(){
		this._server.close();
		console.log('Vakoo stop listen');
	}

	this.serverStart = function(){
		var port = this.fastPort || this.config().port;
		this._server.listen(port);
		this.enableSmtp();
		console.log('Vakoo start at port ',port);
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
				handler:express.json()
			},
			{
				name:'url',
				handler:express.urlencoded()
			},
			{
				name:'cookie',
				handler:express.cookieParser()
			},
			{
				name:'multipart',
				handler:multipart({uploadDir:this.APP_PATH + '/tmp'})
			},
//			{
//				name:'session',
//				handler:express.session({
//					secret:'vakoo secret key',
//					key:'vakoo.sid',
//					cookie  : { maxAge  : new Date(Date.now() + this.config().session_live) }
//				})
//			},
			{
				name:'public',
				handler:express.static(this.PUBLIC_PATH)
			},
			{
				name:'yandex',
				handler:express.static(this.PUBLIC_PATH + '/yandex')
			}
		];

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



    return this;
};


module.exports = Vakoo;