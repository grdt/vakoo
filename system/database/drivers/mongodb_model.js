var ObjectID = require('mongodb').ObjectID;

/**
 * @class CoreModel
 */
var CoreModel = function(){

    this._where = {};

    this._sort = {};

	this._skip = 0;

	this._limit = 0;

	this._order = [];

    this._reservedKeys = ['COLLECTION_NAME','_collection'];

//	this._items = null;

    this.where = function(params){

	    this._where = {};

        for(key in params){
//            if(this.hasOwnProperty(key)){
                if(key == '_id'){
                    params[key] = this.ObjectID(params[key]);
                }

                this._where[key] = params[key];
//            }
        }

	    return this;
    }

	this.order = function(params, object){

		this._order = [];

		object = object || false;

		if(object){
			this._order = params;
			return this;
		}

		for(var key in params){
//			this._order = [key,(params[key] < 0) ? 'descending' : 'ascending'];
			this._order = [key,params[key]];
		}

		return this;
	}

	this.limit = function(skip,limit){

		this._skip = 0;
		this._limit = 0;

		if(typeof limit == "undefined"){
			if(skip.isArray() && skip.length == 2){
				limit = skip[1];
				skip = skip[0];
			}else{
				limit = skip;
				skip = 0;
			}
		}

		if(!skip){
			skip = 0;
		}

		this._skip = skip;
		this._limit = limit;

		return this;
	}

    this.find = function(callback){
		var _this = this;

	    this.collection().find(this._where,function(err,cursor){
		    if(err){
			    console.log(err);
		    }else{

			    if(!_this._order.isEmpty()){
					if(_.isArray(_this._order)){
						cursor.sort(_this._order[0],_this._order[1]);
					}else{
						cursor.sort(_this._order);
					}
			    }

			    if(_this._limit){
				    cursor.skip(_this._skip);
				    cursor.limit(_this._limit);
			    }

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
							    callback([]);
						    }
					    }
				    }
			    })
		    }
	    });
    }

	this.count = function(callback){
		var _this = this;

		this.collection().count(this._where,function(err,count){
			if(err){
				if(typeof callback == "function"){
					callback(0);
				}
			}else{
				if(typeof callback == "function"){
					callback(count);
				}
			}
		});
	}

	this.afterFind = function(done){
		done();
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
						_this.afterFind(function(){
							callback(_this);
						});
                    }
                }else{
                    if(typeof callback == "function"){
                        callback(_this);
                    }
//	                console.log('not found');
                }
            }
        });
    }

    this.save = function(callback){
		var that = this;
		this.beforeSave(function(){
			if(that._id){
				that.update(callback);
			}else{
				that.insert(callback);
			}
		});
    }

	this.beforeUpdate = function(done){
		done();
	}

	this.beforeInsert = function(done){
		done();
	}

	this.beforeSave = function(done){
		done();
	}

    this.insert = function(callback){

        var _this = this;

	    var obj = this;

	    if(obj._id == ''){
		    obj = obj.clean('_id');
	    }else{
		    obj = obj.clean();
	    }

		this.beforeInsert(
			function(){
				_this.collection().insert(obj,function(err,items){
					if(err){
						console.log(err);
						if(typeof callback == "function"){
							callback(null);
						}
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
				})
			}
		);

        return this;
    }

	/**
	 * @param {requestCallback} callback
	 */
    this.update = function(callback){
        var _this = this;
        this.collection().update({_id:this._id},this.clean(),function(err,items){
			if(err){
				console.log('update err',err);
			}
            if(typeof callback == "function"){
                callback(_this);
            }
        });

    }

	this.remove = function(callback){
		var _this = this;
		this.collection().remove({_id:this._id},function(err){
			if(typeof callback == "function"){
				callback();
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
		    }else if(_.isArray(without)){
				for(var i in without){
					out.push(without[i]);
				}
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

	/**
	 * @param attributes
	 * @returns {CoreModel}
	 */
	this.setAttributes = function(attributes){
		var clean = this.clean();

		for(var key in clean){
			var res = (typeof attributes[key] != "undefined") ? attributes[key] : this[key];
			if(res === 'false'){
				res = false;
			}

			if(res === 'true'){
				res = true;
			}

			this[key] = res;
		}

		return this;
	}

    this.ObjectID = function(id){
	    var oid = id;

	    try{
		    oid = new ObjectID(id);
	    }catch(e){

	    }

	    if(id.toString() != oid.toString()){
		    return id;
	    }

        return oid;
    }

    this.collection = function(){
        if(!!this._collection)
            return this._collection;

        this._collection = this.interface.collection(this.COLLECTION_NAME);
        return this._collection;
    }

	this.isEmpty = function(){
		return false;
	}

	this.defineSetGet = function(field,setter,getter){
		this.__defineGetter__(field,getter);
		this.__defineSetter__(field,setter);
	}
}

module.exports = CoreModel;