var db_driver = function(app){
    var _this = this;

    this._app = app;


    var MongoClient = require('mongodb').MongoClient
        , format = require('util').format;


    var path = 'mongodb://';

    this.db = false;

    path += (typeof this._app._config.db.host != "undefined") ? this._app._config.db.host : '127.0.0.1';
    path += (typeof this._app._config.db.port != "undefined") ? ':' + this._app._config.db.port : ':27017';
    path += '/';
    path += this._app._config.db.database;


    this.connect = function(next){
        MongoClient.connect(path, function(err, db) {
            if(err){
                throw new Error(err);
            }else{

                console.log('connect to mongo database',_this._app._config.db.database);

                this.db = db;

                if(typeof next == "function"){
                    next(db);
                }
            }
        });

        return this;
    }

    this.driver = function(){
        var driver = require('./driver')(this.db,this._app);
        return driver;
    }


    return this;
}


module.exports = db_driver;

