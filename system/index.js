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

	this.fastPort = fastPort;

    this.SEPARATOR = '/';
    this.SYSTEM_PATH = __dirname;
    this.APP_PATH = this.SYSTEM_PATH.replace('/system','');
    this.CONFIG_PATH = this.SYSTEM_PATH + this.SEPARATOR + 'config';

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
		console.log('Vakoo start at port ',port);
	}

	this.serverRestart = function(){
		this.serverStop();
		this.serverStart();
	}

	this.middlewareInit = function(mw){
		if(typeof mw == "undefined")
			mw = this.middleware();

		for(key in mw){
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

		this._middleware = [
			{
				name:'logger',
				handler:express.logger('dev')
			},
			{
				name:'error',
				handler:express.errorHandler()
			},
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
			{
				name:'session',
				handler:express.session({
					secret:'vakoo secret key',
					key:'vakooFUCK.sid',
					cookie  : { maxAge  : new Date(Date.now() + this.config().session_live) }
				})
			},
			{
				name:'public',
				handler:express.static(this.APP_PATH + this.SEPARATOR + 'public')
			}
		];

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


    return this;
};


module.exports = Vakoo;