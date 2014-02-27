var express = require('express');
var _ = require('underscore');
var fs = require('fs');

var vakoo = function(options){

    var opts = {
        port:8773,
        defaultController:'main',
        vakoo_path: __dirname,
        app_path: __dirname.replace('/system','')
    }

    if(typeof options != "undefined"){
        for(key in options){
            if(typeof opts[key] != "undefined"){
                opts[key] = options[key];
            }
        }
    }



    this.VAKOO_PATH = opts.vakoo_path;
    this.APP_PATH = opts.app_path;

    _this = this;

    this._express = express();

    this._ = _;

    this.core = require('./core')(this);

    this.router = this.core.router();

    this.controller = this.core.controller();

    this.loader = this.core.loader();

    this.load = core.load = this.loader;

    this.h = {};

    this._config = this.load.config();

    this.db = false;

    this.db_conn = function(next){
        if(typeof this._config.db != "undefined"){
            if(typeof this._config.db.driver != "undefined"){
                if(fs.existsSync(this.VAKOO_PATH + '/database/' + this._config.db.driver)){
                    console.log('db driver',this._config.db.driver,'found','check connection');
                    var connector = require(this.VAKOO_PATH + '/database/' + this._config.db.driver)(this);
                    this.db = {
                        conn:connector
                    };
                    return connector.connect(next);
                }else{
                    throw new Error('database driver ' + this._config.db.driver + ' not found');
                }
            }else{
                throw new Error('database driver not found');
            }
        }
    }

    this.start = function(port){

        this.db_conn(function(db){
            this._app.db.interface = db;
            this._app.db.driver = this.driver();
        });

        if(typeof port == "undefined"){
            port = opts.port;
        }

        this._express.use(express.logger('dev'));

        this._express.use(express.errorHandler());

        this._express.use(this._express.router);

        this.router.init();

        this._express.all('*',function(req,res){
            _this.router.execute(req,res);
        });

        this._express.listen(port);
        
        console.log('start listen',port);
    };

    return this;
};


module.exports = vakoo;