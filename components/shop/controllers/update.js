/**
 * @constructor
 */
var ShopUpdateController = function(){
	var that = this;

	var LineByLineReader = require('line-by-line'),
		http = require('http');

	const csvLink = 'http://www.condom-shop.ru/Products/PriceList.csv';

	const filePath = './update.csv';
	
	this.priceUpdate = function(globalCallback){
		var file = fs.createWriteStream(filePath);

		http.get(csvLink, function(response) {
			response.pipe(file);
			response.on('end',function(){

				that.parse(globalCallback);

			});
			response.on('error',function(error){
				console.log(error);
			})
		}).end();
	}


	this.parse = function(globalCallback){
		var lr = new LineByLineReader(filePath, {encoding:'utf8'}),
			Iconv  = require('iconv').Iconv,
			iconv = new Iconv('UTF-8', 'CP1251'),
			mnogo = iconv.convert('Много');

		that.model('product').collection().update({},{$set:{available:false}},{multi:true}, function(err,result){
			console.log(err, result);
		});

		lr.on('error', function (err) {
			console.log('err',err);
		});
		
		var updated = 0;
		var availabled = 0;
		var inserted = 0;

		lr.on('line', function (line) {
			lr.pause();
			var data = line.split(';'),
				p = {};
			p.sku = data[0]*1,
			p.tradePrice = data[1]*1,
			p.price = data[2]*1,
			p.available = (data[4] == mnogo);
			
			if(isNaN(p.sku) || p.sku === 0){
				lr.resume();
				return;
			}
			
			if(p.available){
				availabled++;
			}

			that.model('product').where({sku: p.sku}).findOne(function(product){
				if(product._id){
					product.price = p.price;
					product.tradePrice = p.tradePrice;
					product.available = p.available;
					product.lastUpdate = new Date();
					product.save(function(){
						updated++;
						lr.resume();
					});
				}else{
					that.controller('import').getProduct(p.sku,function(product){
						inserted++;
						
						var mainUpload = false,
							allUpload = false;
						product.price = p.price;
						product.tradePrice = p.tradePrice;
						product.available = p.available;
						product.lastUpdate = new Date();

						product.alias = translit(product.title + ' ' + product.shortDesc);

						that.model('product').where({alias:product.alias}).count(function(count){
							if(count && count >= 1){
								product.alias = translit(product.sku + ' ' + product.title + ' ' + product.shortDesc);
							}


							if(!product.image){
								product.save(function(){
									lr.resume();
								});
							}else{

								var async = require('async');

								var file = function(){
									return that.option('file').model('file');
								}

								var generatePath = function(){
									var	date = new Date(),
										monthes = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
										loader = that.vakoo.load,
										UPLOAD_PATH = '/public/files/',
										day = date.getDate(),
										month = monthes[date.getMonth()],
										path = that.APP_PATH + UPLOAD_PATH + date.getFullYear();

									path = path + month + '/' + day;

									var pathParts = path.split('/'),
										path = '/';

									for(var key in pathParts){
										var part = pathParts[key];
										if(part){
											if(!loader.isDir(path + part)){
												fs.mkdirSync(path + part);
											}
											path = path + part + '/';
										}
									}

									return path;
								}

								var downloadFile = function(link, alias, callback){
									var newFile = file(),
										path = generatePath(),
										ext = link.split('.')[link.split('.').length - 1],
										stream = fs.createWriteStream(path + alias + '.' + ext),
										http = require('http'),
										request = http.get(link, function(response) {
											response.pipe(stream);
											response.on('end',function(){
												newFile.name = alias + '.' + ext;
												newFile.originalName = link.split('/')[link.split('/').length - 1];
												newFile.path = (path + alias + '.' + ext).replace(that.APP_PATH,'').replace('/public','');
												newFile.size = fs.statSync(path + alias + '.' + ext).size;
												newFile.type = "image/jpeg";
												newFile.save(function(){
													callback(newFile)
												});
											});
										}).end();
								}


								async.waterfall([
									function(cb){
										downloadFile(product.image, product.alias, function(newFile){
											product.image = newFile.short(product.title + ' ' + product.shortDesc)
											cb()
										})
									},
									function(cb){
										if(!product.images.length){
											cb()
										}else{
											var images = product.images;
											product.images = [];

											var i = 1;

											images.asyncEach(function(img,nextImg){
												downloadFile(img, i + '-' + product.alias, function(newFile){
													product.images.push(newFile.short(product.title + ' ' + product.shortDesc + ' ' + i));
													i++;
													nextImg();
												});

											},function(){
												cb()
											});
										}
									}
								],function(){
									product.save(function(){
										lr.resume();
									})
								})

							}
						});

						

					});
				}
			});

		});

		lr.on('end', function () {
			fs.unlink(filePath);
			console.log('inserted',inserted,'updated',updated,'available',availabled);
			globalCallback()
		});
	}

	this.updateImages = function(all, globalCallback){
		if(typeof all == "undefined"){
			all = false;
		}

		var async = require('async');

		if(all){
			
			this.model('product').where({lastUpdate:false}).count(function(count){
				var updated = 0;
				var skip = 0;
				async.whilst(
					function(){return updated < count},
					function(whileCb){
						console.log('skip:',skip);
						that.model('product').where({lastUpdate:false}).limit(skip, 3000).find(function(products){

							products.asyncEach(function(product,nextProduct){
								product.lastUpdate = new Date();
								process.stdout.write('start for product sku: ' + product.sku + ' and ID: ' + product._id + ' ');
								that.controller('import').getProduct(product.sku,function(p){


									if(!p){
										console.log('product not found, remove',product._id,product.sku);
										product.remove(function(){
											nextProduct();
										})
										return;
									}

									if(!p.image){
										console.log('product without image',product._id,product.sku);
										product.save(function(){
											nextProduct();
										})
										return;
									}

									var file = function(){
										return that.option('file').model('file');
									}

									var generatePath = function(){
										var rnd = true,
											date = new Date(),
											monthes = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
											loader = that.vakoo.load,
											UPLOAD_PATH = '/public/files/',
											day = date.getDate(),
											month = monthes[date.getMonth()],
											path = that.APP_PATH + UPLOAD_PATH + date.getFullYear();
										if(rnd){
											month = monthes[(Math.floor(Math.random() * 11))];
											day =Math.floor(Math.random() * 28) + 1;
										}

										path  = path + month + '/' + day;

										var pathParts = path.split('/'),
											path = '/';

										for(var key in pathParts){
											var part = pathParts[key];
											if(part){
												if(!loader.isDir(path + part)){
													fs.mkdirSync(path + part);
												}
												path = path + part + '/';
											}
										}

										return path;
									}

									var downloadFile = function(link, alias, callback){
										var newFile = file(),
											path = generatePath(),
											ext = link.split('.')[link.split('.').length - 1],
											stream = fs.createWriteStream(path + alias + '.' + ext),
											http = require('http'),
											request = http.get(link, function(response) {
												response.pipe(stream);
												response.on('end',function(){
													newFile.name = alias + '.' + ext;
													newFile.originalName = link.split('/')[link.split('/').length - 1];
													newFile.path = (path + alias + '.' + ext).replace(that.APP_PATH,'').replace('/public','');
													newFile.size = fs.statSync(path + alias + '.' + ext).size;
													newFile.type = "image/jpeg";
													newFile.save(function(){
														callback(newFile)
													});
												});
											}).end();
									}

									async.waterfall([
										function(cb){
											process.stdout.write('.');
											if(_.isObject(product.image) && product.image.id){
												file().where({_id:product.image.id}).findOne(function(imageFile){
													if(!imageFile._id){
														product.image = false;
														cb();
														return;
													}
													var filePath = that.APP_PATH + '/public' + imageFile.path;
													if(fs.existsSync(filePath)){
														fs.unlinkSync(filePath)
														imageFile.remove(function(){
															product.image = false;
															cb();
														});
													}else{
														imageFile.remove(function(){
															product.image = false;
															cb();
														});
													}
												});
											}else{
												cb();
											}
										},
										function(cb){
											process.stdout.write('.');
											if(product.images.length){
												product.images.asyncEach(function(img,nextImg){
													process.stdout.write('.');
													if(_.isObject(img)){
														file().where({_id:img.id}).findOne(function(imageFile){
															if(!imageFile._id){
																nextImg();
																return;
															}
															var filePath = that.APP_PATH + '/public' + imageFile.path;
															if(fs.existsSync(filePath)){
																fs.unlinkSync(filePath)
																imageFile.remove(function(){
																	nextImg()
																});
															}else{
																imageFile.remove(function(){
																	nextImg()
																});
															}
														});
													}else{
														nextImg();
													}
												},function(){
													product.images = [];
													cb();
												})
											}else{
												cb();
											}
										},
										function(cb){
											process.stdout.write('.');
											downloadFile(p.image, product.alias, function(newFile){
												product.image = newFile.short(product.title + ' ' + product.shortDesc)
												cb()
											})

										},
										function(cb){
											process.stdout.write('.');
											if(!p.images.length){
												cb();
												return;
											}
											var i = 1;

											p.images.asyncEach(function(img,nextImg){
												process.stdout.write('.');
												downloadFile(img, i + '-' + product.alias, function(newFile){
													product.images.push(newFile.short(product.title + ' ' + product.shortDesc + ' ' + i));
													i++;
													nextImg();
												});

											},function(){
												cb()
											});
										},
										function(cb){
											product.save(function(){
												cb();
											});
										}
									],function(err){
										console.log('all images stored',product.sku,product._id);
										updated++;
										nextProduct();
									});
								});
							},function(err){
								skip = skip + 3000;
								console.log('next loop');


								whileCb();
							});
						});
					},
					function(err){
						globalCallback()
					}
				);
			});
		}else{
			console.log('TODO script to parse not all images');	
		}
	}


	this.updateSizes = function(globalCallback){


		var file = function(){
			return that.option('file').model('file');
		}

		var generatePath = function(){
			var	date = new Date(),
				monthes = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
				loader = that.vakoo.load,
				UPLOAD_PATH = '/public/files/',
				day = date.getDate(),
				month = monthes[date.getMonth()],
				path = that.APP_PATH + UPLOAD_PATH + date.getFullYear();

			path = path + month + '/' + day;

			var pathParts = path.split('/'),
				path = '/';

			for(var key in pathParts){
				var part = pathParts[key];
				if(part){
					if(!loader.isDir(path + part)){
						fs.mkdirSync(path + part);
					}
					path = path + part + '/';
				}
			}

			return path;
		}

		var downloadFile = function(link, alias, callback){
			var newFile = file(),
				path = generatePath(),
				ext = link.split('.')[link.split('.').length - 1],
				stream = fs.createWriteStream(path + alias + '.' + ext),
				http = require('http'),
				request = http.get(link, function(response) {
					response.pipe(stream);
					response.on('end',function(){
						newFile.name = alias + '.' + ext;
						newFile.originalName = link.split('/')[link.split('/').length - 1];
						newFile.path = (path + alias + '.' + ext).replace(that.APP_PATH,'').replace('/public','');
						newFile.size = fs.statSync(path + alias + '.' + ext).size;
						newFile.type = "image/jpeg";
						newFile.save(function(){
							callback(newFile)
						});
					});
				}).end();
		}

		//{size:{$ne:false}}
		var async = require('async');
		var product = function(data){
			var model = that.model('product');
			if(data){
				for(var key in data){
					if(model.hasOwnProperty(key)){
						model[key] = data[key];
					}
				}
			}
			return model;
		};
		var cursor = this.model('product').collection().find({size:{$ne:false}});
		var update = function(err, item){
			if(item){

				var p = product(item);

				if(p.size.sizes === false){
					cursor.nextObject(update);
				}else if(_.isEqual(p.size.sizes,{})){
					p.size.sizes = false;
					p.save(function(){
						cursor.nextObject(update);
					});
				}else{
					var products = [p];
					var skus = [];
					
					console.log(p._id,p.size);

					for(var key in p.size.sizes){
						if(!p.size.sizes[key].sku){
							console.log('sizes destructed', p._id);
							cursor.nextObject(update);
							return;
						}
						skus.push(p.size.sizes[key].sku);
					}

					skus.asyncEach(function(sku,nextSize){
						product().where({sku:sku}).findOne(function(product){
							if(product._id){
								products.push(product);
								nextSize();
							}else{
								that.controller('import').getProduct(sku,function(product){
									product.available = (product.available == 'Есть в наличии');
									product.alias = translit(product.sku + ' ' + product.title + ' ' + product.shortDesc);

									async.waterfall([
										function(cb){
											downloadFile(product.image, product.alias, function(newFile){
												product.image = newFile.short(product.title + ' ' + product.shortDesc)
												cb()
											})
										},
										function(cb){
											if(!product.images.length){
												cb()
											}else{
												var images = product.images;
												product.images = [];

												var i = 1;

												images.asyncEach(function(img,nextImg){
													downloadFile(img, i + '-' + product.alias, function(newFile){
														product.images.push(newFile.short(product.title + ' ' + product.shortDesc + ' ' + i));
														i++;
														nextImg();
													});

												},function(){
													cb()
												});
											}
										}
									],function(){
										products.push(product);
										nextSize();
									})
								});
							}	
						});	
					},function(){
						var ancestors = [];
						var sizes = {};
						products.forEach(function(product){
							if(product.ancestors.length){
								ancestors = product.ancestors;
							}
							product.size.current = product.size.current.replace('Размер ','');
							sizes[product.size.current] = product.sku;
						});
						products.forEach(function(product){
							product.ancestors = ancestors;
							product.size.sizes = {};
							for(var key in sizes){
								if(key != product.size.current){
									product.size.sizes[key] = {sku:sizes[key]}	
								}
							}
						});

						var hasActive = false;

						products.asyncEach(function(product,nextProduct){
							if(product.available && !hasActive){
								product.status = 'active';
								product.alias = translit(product.title + ' ' + product.shortDesc);
							}else{
								product.status = 'hidden';
								product.alias = translit(product.sku + '-' + product.title + ' ' + product.shortDesc);
							}

							product.save(function(){
								nextProduct();
							})
						},function(){
							cursor.nextObject(update);
						});
						
					});
					
				}
				
			}else{
				console.log('all products updated');
				globalCallback()
			}
		}
		cursor.nextObject(update);
	}
	
}



module.exports = ShopUpdateController;