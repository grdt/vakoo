var Page = function(){

    this.COLLECTION_NAME = 'pages';

    this._id = '';

    this.alias = '';

    this.teaser = '';

    this.content = '';

    this.status = '';

    this.added = new Date();

    this.published = new Date();

    this.last_modifed = new Date();

    this.byAlias = function(alias,callback){
        this.where({alias:alias});
        this.findOne(callback);
        return this;
    }

    return this;
}

module.exports = Page;