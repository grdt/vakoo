var Db = function(config){

    var Db = this;

    this.DEFAULT_DRIVER = 'mongodb';
    this.DEFAULT_HOST = '127.0.0.1';
    this.DEFAULT_DATABASE = 'vakoo';

    this.driver = (typeof config.driver != "undefined") ? config.driver : this.DEFAULT_DRIVER;
    this.host = (typeof config.host != "undefined") ? config.host : this.DEFAULT_HOST;
    this.database = (typeof config.database != "undefined") ? config.database : this.DEFAULT_DATABASE;

    this.interface = false;
    this._driver = false;
    this.model = false;

    this.loadDriver = function(){
        var driver = require(this.DB_DRIVERS_PATH + this.SEPARATOR + this.driver);

        driver.prototype = this;

        this._driver = new driver();

        this._driver.connect();

        this._driver.emitter.on('db_err',function(err){
            console.log('db connection err',err);
        });

        this._driver.emitter.on('db_conn',function(db){
            console.log(Db.driver,'connect successfull');
	        Db.interface = db;
	        Db.initPlugin('after_db_init');
	        Db.loadModel();
        });
    }

    this.loadModel = function(){
        if(this.isFile(this.DB_DRIVERS_PATH + this.SEPARATOR + this.driver + '_model' + this.EXT_JS)){
            var model = require(this.DB_DRIVERS_PATH + this.SEPARATOR + this.driver + '_model');
            model.prototype = this;
            this.model = new model();
        }else{
            console.log('model not found');
        }
    }

    if(this.isFile(this.DB_DRIVERS_PATH + this.SEPARATOR + this.driver + this.EXT_JS)){
        this.loadDriver();
    }else{
        console.log('driver not found');
    }

    return this;
}



module.exports = Db;



