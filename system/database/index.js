var Db = function(config){

    this.DEFAULT_DRIVER = 'mongodb';
    this.DEFAULT_HOST = '127.0.0.1';
    this.DEFAULT_DATABASE = 'vakoo';

    this.driver = (typeof config.driver != "undefined") ? config.driver : this.DEFAULT_DRIVER;
    this.host = (typeof config.driver != "undefined") ? config.driver : this.DEFAULT_HOST;
    this.database = (typeof config.driver != "undefined") ? config.driver : this.DEFAULT_DATABASE;


    this.loadDriver = function(){

    }

    if(this.isFile(this.DB_DRIVERS_PATH + this.SEPARATOR + this.driver + this.EXT_JS)){
        this.loadDriver();
    }

    return this;
}



module.exports = Db;



