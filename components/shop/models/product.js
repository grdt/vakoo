/**
 * @class ShopProductModel
 * @extends CoreModel
 */
var ShopProductModel = function () {

	this.COLLECTION_NAME = 'products';
	
	var that = this;

	const metaObject = {
		description:'',
		title:'',
		keywords:''
	};

	const imageObject = {
		id:'id',
		name:'name',
		alt:'alt',
		path:''
	};


	this._id = '';

	this.title = '';

	this.alias = '';

	this.category = '';

	this.ancestors = [];

	this.price = 0;

	this.tradePrice = 0;

	this.sku = '';

	this.desc = '';

	this.shortDesc = '';

	this.status = 'active';

	this.available = false;

	this.meta = metaObject;

	this.params = [];

	this.size = {
		current:'XS-L',
		sizes:{}
	};

	this.group = {
		current:'',
		groups:[]
	};

	this.videos = [];

	this.image = imageObject;

	this.images = [imageObject];

	this.lastUpdate = false;

	this.url = function () {
		return '/' + this.ancestors.join('/') + '/' + this.alias;
	}

	/**
	 * @param attributes
	 * @returns ShopProductModel
	 */
	this.setAttributes = function(attributes){
		var clean = this.clean();

		for(var key in clean){
			if(key == 'category' && attributes[key] != this[key]){
				this.setCategory(attributes[key]);
			}
			this[key] = attributes[key] || this[key];
		}

		return this;
	}

	this.setCategory = function(categoryId){
		this.option('shop').model('category').where({_id:categoryId}).findOne(function(category){
			if(category._id){
				that.ancestors = category.ancestors;
				that.ancestors.push(category._id);
				that.category = category._id;
				that.save();
			}else{
				console.log('category not found!!! WTF!!!');
			}
		});
	}
	
	this.beforeSave = function(done){
		this.alias = translit(this.title);
		if(this.available == 'Есть в наличии'){
			this.available = true;
		}

		if(!_.isBoolean(this.available)){
			this.available = false;
		}

		done();
	}
	
	this.afterFind = function(done){
		if(_.isString(this.image)){
			/** @type FileModel file */
			var file = this.option('file').model('file');
			file.loadFromSource(this.image,this.alias, function(){
				file.save(function(){
					that.image = imageObject.clone();
					that.image.id = file._id;
					that.image.path = file.path;
					that.image.name = file.name;
					that.image.alt = that.shortDesc;
					that.save();
				});
			});
			if(this.images.length){
				var images = this.images.clone();
				this.images = [];
				images.forEach(function(image, i, array){
					if(!_.isString(image)){
						that.images.push(image);
						if(last){
							that.save();
							done();
						}
					}else{
						var last = (i == (array.length - 1));
						var file = that.option('file').model('file');
						file.loadFromSource(image,i + '-' + that.alias, function(){
							file.save(function(){
								var obj = imageObject.clone();
								obj.id = file._id;
								obj.path = file.path;
								obj.name = file.name;
								obj.alt = that.shortDesc;
								that.images.push(obj);

								if(last){
									that.save();
									done();
								}

							});
						});
					}
				});
			}else{
				done();
			}
		}else{
			done();
		}

		if(this.group.isEqual({current:"",groups:[]})){
			this.group = false;
			this.save();
		}
		
	}
	
	this.getActualInfo = function(done){
		this.option('shop').controller('import').getProduct(this.sku,function(newProduct){
			var result = newProduct.clean();
			that.group = result.group;
			that.tradePrice = newProduct.tradePrice;
			that.lastUpdate = new Date();
			that.save();
			done(newProduct);
		});
	}

}

module.exports = ShopProductModel;