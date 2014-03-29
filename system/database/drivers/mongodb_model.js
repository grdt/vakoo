var Model = function(){

    this.where = function(params){
        console.log(this.COLLECTION_NAME);
        console.log('where',params);
    }

    this.find = function(){

    }

    

    return this;
}

module.exports = Model;