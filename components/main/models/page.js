var Page = function(){

    this.COLLECTION_NAME = 'pages';



    this.alias = function(alias){
        this.where({alias:alias});
        this.find();
    }

    return this;
}

module.exports = Page;