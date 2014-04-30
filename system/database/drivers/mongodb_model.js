var ObjectID = require('mongodb').ObjectID;

var Model = function(){

    this._where = {};

    this._sort = {};

    this._reservedKeys = ['COLLECTION_NAME','_collection'];

//	this._items = null;

    this.where = function(params){

	    this._where = {};

        for(key in params){
            if(this.hasOwnProperty(key)){
                if(key == '_id'){
                    params[key] = this.ObjectID(params[key]);
                }

                this._where[key] = params[key];
            }
        }

	    return this;
    }

    this.find = function(callback){
		var _this = this;

	    this.collection().find(this._where,function(err,cursor){
		    if(err){
			    console.log(err);
		    }else{
			    cursor.toArray(function(err,items){
				    if(err){
					    console.log(err);
				    }else{
					    if(items.length){

//						    _this._items = items;

						    var collection = [];

						    items.forEach(function(item,i){
							    var clone = _this.clone();
							    for(key in item){
								    if(clone.hasOwnProperty(key)){
									    clone[key] = item[key];
								    }
							    }

							    collection.push(clone);
						    })



						    if(typeof callback == "function"){
							    callback(collection);
						    }

					    }else{
						    if(typeof callback == "function"){
							    callback(null);
						    }
					    }
				    }
			    })
		    }
	    });
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

	    var object;

	    if(typeof this._keys != "undefined"){

		    var m_keys = this._keys;

		    var out = this._reservedKeys.clone();

		    var funcs = this.functions();

		    for(f in funcs){
			    m_keys = m_keys.without(funcs[f]);
		    }

		    if(_.isString(without)){
			    out.push(without);
		    }


		    for(key in out){
			    m_keys = m_keys.without(out[key]);
		    }



		    return _.pick(this, m_keys);
	    }

        //todo: refactor cleaner
	    
	    var clone = this.clone();
	    var funcs = clone.functions();
	    var keys = clone.keys();

	    for(key in funcs){
		    keys = keys.without(funcs[key]);
	    }

        for(key in this._reservedKeys){
            keys = keys.without(this._reservedKeys[key]);
        }

        if(typeof without == "string"){
            keys = keys.without(without);
        }else{
            if(typeof without == "object"){
                for(key in without){
                    keys = keys.without(without[key]);
                }
            }
        }



	    if(typeof this._keys != "undefined"){
		    object = _.pick(this,keys);
	    }else{
		    object = _.pick(this,keys);
	    }

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