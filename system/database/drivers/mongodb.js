var events = require('events');

var Emitter = new events.EventEmitter();

var Driver = function(){


    var driver = this;

    this.connect = function(){

        this._client = require('mongodb').MongoClient;

        this._client.connect('mongodb://' + this.host + ':27017' + this.SEPARATOR + this.database,function(err,db){
            if(err){
                driver.emitter.emit('db_err',err);
            }else{
                driver.emitter.emit('db_conn',db);
            }
        });
    }

    this.emitter = Emitter;

    return this;
}



module.exports = Driver;

