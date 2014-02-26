var express = require('express');
var _ = require('underscore');

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

    this.listen = function(port){

        if(typeof port == "undefined"){
            port = opts.port;
        }

        _this._express.use(_this._express.router);

        _this.router.init();

        _this._express.all('*',function(req,res){
            _this.router.execute(req,res);
        });

        _this._express.listen(port);
    };

    return this;
};


module.exports = vakoo;