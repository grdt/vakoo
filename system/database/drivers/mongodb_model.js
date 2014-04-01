var _ = require('underscore');
var ObjectID = require('mongodb').ObjectID;

var Model = function(){

    this._where = {};

    this._sort = {};

    this._reservedKeys = ['COLLECTION_NAME','_collection'];

    this.where = function(params){
        for(key in params){
            if(this.hasOwnProperty(key)){
                if(key == '_id'){
                    params[key] = this.ObjectID(params[key]);
                }

                this._where[key] = params[key];
            }
        }
    }

    this.find = function(){

    }

    this.findOne = function(callback){

        var _this = this;

        this.collection().findOne(this._where,function(err,item){
            if(err){
                console.log(err);
            }else{
                if(item){
                    for(key in item){
                        if(_this.hasOwnProperty(key)){
                            _this[key] = item[key];
                        }
                    }

                    if(typeof callback == "function"){
                        callback(_this);
                    }
                }else{
                    if(typeof callback == "function"){
                        callback(_this);
                    }
                    console.log('not found');
                }
            }
        });
    }

    this.save = function(callback){
        if(this._id){
            this.update(callback);
        }else{
            this.insert(callback);
        }
    }

    this.insert = function(callback){

        var _this = this;

        this.collection().insert(this.clean(['_id']),function(err,items){
            if(err){
                console.log(err);
            }else{
                if(items.length == 1){
                    for(key in items[0]){
                        if(_this.hasOwnProperty(key)){
                            _this[key] = items[0][key];
                        }
                    }

                    if(typeof callback == "function"){
                        callback(_this);
                    }

                }else{
                    //todo collection return
                }
            }
        });

        return this;
    }

    this.update = function(callback){
        var _this = this;

        this.collection().update({_id:this._id},this.clean(),function(err,items){
            if(typeof callback == "function"){
                callback(_this);
            }
        });

    }

    this.clean = function(without){

        //todo: refactor cleaner

        var keys = _.keys(this);

        for(key in this._reservedKeys){
            keys = _.without(keys,this._reservedKeys[key]);
        }

        if(typeof without == "string"){
            keys = _.without(keys,without);
        }else{
            if(typeof without == "object"){
                for(key in without){
                    keys = _.without(keys,without[key]);
                }
            }
        }

        var funcs = _.functions(this);

        for(func in funcs){
            keys = _.without(keys, funcs[func]);
        }

        var object = _.pick(this,keys);

        return object;
    }

    this.ObjectID = function(id){
        return new ObjectID(id);
    }

    this.collection = function(){
        if(!!this._collection)
            return this._collection;

        this._collection = this.interface.collection(this.COLLECTION_NAME);
        return this._collection;
    }

    return this;
}

module.exports = Model;