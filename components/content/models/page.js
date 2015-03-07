var PageModel = function(){
	var that = this;

	this.COLLECTION_NAME = 'pages';

	const metaObject = {
		description:'',
		title:'',
		keywords:''
	};

	const imageObject = {
		id:'',
		name:'',
		alt:'',
		path:''
	};


	this._id = '';

	this.title = '';

	this.image = imageObject;

	this.alias = '';

    this.label = '';

	this.anonce = '';

	this.content = '';

	this.type = 'article';

	this.created = new Date();

	this.publish = new Date();

	this.status = 'hidden';

	this.meta = metaObject;

	this.beforeSave = function(done){
		if(!this.alias){
			this.alias = translit(this.title);
		}
		done();
	}

	this.url = function(){
		if(this.vakoo.isProduction()){
			return '/' + this.alias;
		}else{
			return '/page?id=' + this._id;
		}
	}

}

module.exports = PageModel;