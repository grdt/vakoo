var Loader = require('./core/loader'),
    _ = require('underscore'),
    express = require('express'),
    fs = require('fs');

var vakoo = function(){

    var vakoo = this;

    this.SEPARATOR = '/';
    this.SYSTEM_PATH = __dirname;
    this.APP_PATH = this.SYSTEM_PATH.replace('/system','');
    this.CONFIG_PATH = this.SYSTEM_PATH + this.SEPARATOR + 'config';

    this.EXT_JS = '.js';
    this.EXT_JSON = '.json';

    this._express = express();

    this.start = function(){

        this.load = new Loader(this);

        this._express.use(express.logger('dev'));

        this._express.use(express.errorHandler());

        this._express.all('*',function(req,res){
            vakoo.load.execute(req,res);
        });

        this._express.listen(this.config().port);

        console.log('Vakoo start at port ',this._config.port);

    };

    this.config = function(){
        if(!!this._config)return this._config;

        var default_config = (fs.existsSync(this.CONFIG_PATH + this.SEPARATOR + 'config' + this.EXT_JSON)) ? require(this.CONFIG_PATH + this.SEPARATOR + 'config' + this.EXT_JSON) : false;
        var config = (fs.existsSync(this.APP_PATH + this.SEPARATOR + 'config' + this.EXT_JSON)) ? require(this.APP_PATH + this.SEPARATOR + 'config' + this.EXT_JSON) : false;
        if(config){
            config = _.defaults(config,default_config);
        }else{
            config = default_config;
        }

        this._config = config;

        return config;
    }


    return this;
};


module.exports = vakoo;