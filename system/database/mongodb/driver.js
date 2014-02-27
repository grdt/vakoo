var driver = function(db,app){
    var _this = this;
    var _app = app;

    this.db = db;

    this.objectId = db.ObjectID;

    this._collection = false;

    this._reservedKeys = ['_collectionName','collectionName'];

    this._error = false;

    this.collection = function(){
        return (this._collection || this.db.collection(this.collectionName));
    }

    this.save = function(next){
        if(this.isNew()){
            this.updateOne(next);
        }else{
            this.insertOne(next);
        }
        return this;
    }

    this.isNew = function(){
        return this._id;
    }

    this.insertOne = function(next){
        var object = this._app._.omit(this.clean(),'_id');
        this.collection().insert(object,function(err,res){
            if(err){
                _this.error = err;
            }else{
                _this._id = res[0]._id;
            }

            this.n(next);

        });
        return this;
    }

    this.updateOne = function(next){
        return this;
    }

    this.clean = function(){
        var keys = this._app._.keys(this);
        for(key in this._reservedKeys){
            keys = this._app._.without(keys,this._reservedKeys[key]);
        }
        var object = this._app._.pick(this,keys);
        
        console.log(object);

        return object;
    }

    this.n = function(next){
        if(typeof next == "function"){
            next();
        }
    }

    return this;

}



module.exports = driver;