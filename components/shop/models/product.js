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
		if(this.vakoo.ENVIRONMENT == 'development'){
			return '/shop/products/index?id=' + this._id;
		}
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
		var that = this;
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
		if(!this.alias){
			this.alias = translit(this.title);
		}

		if(this.available == 'Есть в наличии'){
			this.available = true;
		}

		if(!_.isBoolean(this.available)){
			this.available = false;
		}
		done();
	}
	
	this.afterFind = function(done){

		if(!this.meta.title){
			this.meta.title = this.title + '. ' + this.shortDesc;
		}

		if(!this.meta.description){
			this.meta.description = this.desc;
		}

//		if(!this.meta.keywords){
//			this.meta.keywords = this.desc;
//		}

		if(this.group.isEqual({current:"",groups:[]})){
			this.group = false;
			this.save();
		}

		if(this.size && this.size.sizes.isEqual({})){
			this.size.sizes = false;
		}

		if(this.size && this.size.sizes){
			var sku = [];
			for(var key in this.size.sizes){
				sku.push(this.size.sizes[key].sku);
			}

			this.clone().where({sku:{$in:sku}}).find(function(products){
				products.forEach(function(product){

					product.ancestors = that.ancestors;

					that.size.sizes[product.size.current] = {
						id:product._id,
						size:product.size.current
					};
				})

				done();
			})

		}else{
			done();
		}
	}
	
	this.getActualInfo = function(done){
		this.option('shop').controller('import').getProduct(this.sku,function(newProduct){
			var result = newProduct.clean();
			that.group = result.group;
			that.tradePrice = newProduct.tradePrice;
			that.lastUpdate = new Date();
			that.save();
			done(result);
		});
	}

	this._price = 0;
	this.defineSetGet('price',function(price){
		this._price = price;
	},function(){
		var price = this._price;
		if(price < this.tradePrice){
			price = this.tradePrice;
		}
		if(price < 500){
			return parseInt(price / 10) * 10;
		}
		price = parseInt(price / 100) * 100;
		return price;
	})
}

module.exports = ShopProductModel;