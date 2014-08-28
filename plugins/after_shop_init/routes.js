var Susanin = require('susanin');
var Plugin = function(){

	this._init = false;

	var $p = this;

	var that = this;

	const CATEGORY = 'category';

	this.title = 'trololo';

	/**
	 * @param {Object=} where
	 * @returns ShopCategoryModel class
	 */
	function categoryModel(where){
		var model = that.option('shop').model(CATEGORY);
		if(typeof where != "undefined"){
			model.where(where);
		}
		return model;
	}

	const PRODUCT = 'product';

	/**
	 * @param {Object=} where
	 * @returns ShopProductModel class
	 */
	function productModel(where){
		var model = that.option('shop').model(PRODUCT);
		if(typeof where != "undefined"){
			model.where(where);
		}
		return model;
	}

	this.init = function(){

		that.aza();

		if(this.vakoo.ENVIRONMENT == 'production'){

			that.option('shop').model('category').find(function(categories){
				categories.forEach(function(category){

					var route_string = category.url();
					var route = Susanin.Route(route_string);
					route.executor = {
						option:"shop",
						controller:"categories",
						method:"index",
						id:category._id
					}
					$p.addRoute(route);
				});

				console.log('categories routes enabled');
			});


			that.option('shop').model('product').where({category:{$ne:''}}).find(function(products){
				products.forEach(function(product){
					var route_string = product.url();
					var route = Susanin.Route(route_string);
					route.executor = {
						option:"shop",
						controller:"products",
						method:"index",
						id:product._id
					}
					$p.addRoute(route);
				});

				console.log('products routes enabled');
			});

			that.option('content').model('page').find(function(pages){
				pages.forEach(function(page){
					var route_string = page.url();
					var route = Susanin.Route(route_string);
					route.executor = {
						option:"content",
						controller:"controller",
						method:"article",
						id:page._id
					}
					$p.addRoute(route);
				});

				console.log('pages routes enabled');
			});

		}
	}

	this.aza = function(){

		if(this.vakoo.ENVIRONMENT != 'test')
			return;

		var http = require('http');
		var pathes = [
			'astkol-sex',
			'inspirit',
			'condoms/mysize',
			'condoms/gartelle',
			'condoms/gartelle-gel',
			'condoms/mysize-gel',
			'condoms/viva',
			'condoms/viva-gel',
			'condoms/one-touch',
			'condoms/vitalis',
			'condoms/vitalis-gel',
			'condoms/one-touch-gel',
			'eroticfantasy',
			'andrey',
			'condoms/playboy',
			'shunga',
			'lelo',
			'kazanova-sex',
			'condoms/durex',
			'condoms/domino',
			'condoms/domino-gel',
			'condoms/nabor',
			'condoms/ganzo',
			'condoms/okamoto',
			'condoms/vizit',
			'condoms/vizit-gel',
			'bioritm',
			'condoms/contex-gel',
			'condoms/durex-gel',
			'condoms/contex',
			'condoms/luxe',
			'condoms/luxe-gel',
			'books',
			'condoms/masculan',
			'condoms/masculan-gel',
			'condoms/sagami',
			'condoms/sagami-gel',
			'condoms/sico',
			'condoms/sico-gel',
			'condoms/feel',
			'condoms/feel-gel',
			'condoms/sitabella',
			'kema-belie-baci',
			'kema-sex',
			'eroteam',
			'kema-lashes-baci',
			'erosklad',
			'pipedream'
		];

		var loader = that.vakoo.load;

		var stack = Array.apply(null, {length: 500}).map(Number.call, Number);

		stack.asyncEach(function(i,doneStack){
			(function(iterator){

				var lim = 67;

				that.option('file').model('file').where({"finded":{$ne:true}}).limit(iterator * lim, lim).find(function(files){

					files.asyncEach(function(file,done){

						if(file.finded){
							console.log(file._id,'already finded');
							done();
							return;
						}

						if(loader.isFile(that.APP_PATH + '/public' + file.path)){
							console.log(file._id,'file already downloaded');
							file.finded = true;
							file.save(function(){
								done();
							});
							return;
						}


						console.log('start processing',file._id);

						pathes.asyncEach(function(path,donePath){
							var link = 'http://static.condom-shop.ru/' + path + '/' + file.originalName;

							var req = http.request({
									method:'HEAD',
									host:'static.condom-shop.ru',
									path:'/' + path + '/' + file.originalName
								}, function(res) {

									if(res.statusCode == 200){

										console.log(file._id,'http://static.condom-shop.ru' + res.req.path, 'download ... ');

										http.get('http://static.condom-shop.ru' + res.req.path, function(response) {
											var uploadDirs = (that.APP_PATH + '/public' + file.path).split('/');

											var uploadPath = '';

											for(key in uploadDirs){
												if(file.name != uploadDirs[key]){
													uploadPath += uploadDirs[key] + '/';
													if(!loader.isDir(uploadPath)){
														fs.mkdirSync(uploadPath);
													}
												}else{
													var stream = fs.createWriteStream(uploadPath + file.name);
												}
											}

											response.pipe(stream);

											file.finded = true;

											response.on('end',function(){

												file.save(function(){
													done();
												});

											});
										});

									}else{
										donePath();
									}
								}
							);

							req.end();

						},function(){
							if(!file.finded){
								console.log(file._id,'file not found',file.name,file.originalName);
							}
							done();
						});
					},function(){
						doneStack();
						console.log('done stack');
					});
				});
			}).call(this,i);
		});


	}
}

module.exports = Plugin;