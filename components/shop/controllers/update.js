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

		that.model('product').collection().update({},{$set:{available:false,isNew:false}},{multi:true}, function(err,result){
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

                    if(!p.available) {
                        console.log("skip not available");
                        lr.resume();
                    }else{

                        that.controller('import').getProduct(p.sku, function (product) {
                            inserted++;

                            var mainUpload = false,
                                allUpload = false;
                            product.price = p.price;
                            product.tradePrice = p.tradePrice;
                            product.available = p.available;
                            product.isNew = true;
                            product.lastUpdate = new Date();

                            product.alias = translit(product.title + ' ' + product.shortDesc);

                            that.model('product').where({alias: product.alias}).count(function (count) {
                                if (count && count >= 1) {
                                    product.alias = translit(product.sku + ' ' + product.title + ' ' + product.shortDesc);
                                }


                                if (!product.image) {
                                    product.save(function () {
                                        lr.resume();
                                    });
                                } else {

                                    var async = require('async');

                                    var file = function () {
                                        return that.option('file').model('file');
                                    }

                                    var generatePath = function () {
                                        var date = new Date(),
                                            monthes = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                                            loader = that.vakoo.load,
                                            UPLOAD_PATH = '/public/files/',
                                            day = date.getDate(),
                                            month = monthes[date.getMonth()],
                                            path = that.APP_PATH + UPLOAD_PATH + date.getFullYear();

                                        path = path + month + '/' + day;

                                        var pathParts = path.split('/'),
                                            path = '/';

                                        for (var key in pathParts) {
                                            var part = pathParts[key];
                                            if (part) {
                                                if (!fs.existsSync(path + part)) {
                                                    fs.mkdirSync(path + part);
                                                }
                                                path = path + part + '/';
                                            }
                                        }

                                        return path;
                                    }

                                    var downloadFile = function (link, alias, callback) {
                                        var newFile = file(),
                                            path = generatePath(),
                                            ext = link.split('.')[link.split('.').length - 1],
                                            stream = fs.createWriteStream(path + alias + '.' + ext),
                                            http = require('http'),
                                            request = http.get(link, function (response) {
                                                response.pipe(stream);
                                                response.on('end', function () {
                                                    newFile.name = alias + '.' + ext;
                                                    newFile.originalName = link.split('/')[link.split('/').length - 1];
                                                    newFile.path = (path + alias + '.' + ext).replace(that.APP_PATH, '').replace('/public', '');
                                                    newFile.size = fs.statSync(path + alias + '.' + ext).size;
                                                    newFile.type = "image/jpeg";
                                                    newFile.save(function () {
                                                        callback(newFile)
                                                    });
                                                });
                                            }).end();
                                    }


                                    async.waterfall([
                                        function (cb) {
                                            downloadFile(product.image, product.alias, function (newFile) {
                                                product.image = newFile.short(product.title + ' ' + product.shortDesc)
                                                cb()
                                            })
                                        },
                                        function (cb) {
                                            if (!product.images.length) {
                                                cb()
                                            } else {
                                                var images = product.images;
                                                product.images = [];

                                                var i = 1;

                                                images.asyncEach(function (img, nextImg) {
                                                    downloadFile(img, i + '-' + product.alias, function (newFile) {
                                                        product.images.push(newFile.short(product.title + ' ' + product.shortDesc + ' ' + i));
                                                        i++;
                                                        nextImg();
                                                    });

                                                }, function () {
                                                    cb()
                                                });
                                            }
                                        }
                                    ], function () {
                                        product.save(function () {
                                            lr.resume();
                                        })
                                    })

                                }
                            });


                        });
                    }
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
					if(!fs.existsSync(path + part)){
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
											if(!product.image){
												cb();
												return;
											}
											downloadFile(product.image, product.alias, function(newFile){
												product.image = newFile.short(product.title + ' ' + product.shortDesc)
												cb()
											})
										},
										function(cb){
											if(!product.images || !product.images.length){
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
						products.forEach(function(product, i){
							if(!product.size){
								delete products[i];
							}else{
								if(!product.ancestors){
									product.ancestors = [];
								}
								if(product.ancestors && product.ancestors.length){
									ancestors = product.ancestors;
								}
								product.size.current = product.size.current.replace('Размер ','');
								sizes[product.size.current] = product.sku;
							}
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
							if(!product){
								nextProduct();
								return;
							}
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

	this.catchUnowned = function(globalCb){
		console.log("start catch unowned products");
		var regs = {
			"komplekty-belya":[
				new RegExp("комплект","i"),
				new RegExp("ко��плект","i"),
				new RegExp("комплек��","i"),
				new RegExp("корсет(.*)стринги","i"),
				new RegExp("сорочка(.*)стринги","i"),
				new RegExp("мини-платье(.*)стринги","i"),
				new RegExp("комбинация(.*)стринги","i"),
				new RegExp("корсет(.*)трусики","i"),
				new RegExp("сорочка(.*)трусики","i"),
				new RegExp("мини-платье(.*)трусики","i"),
				new RegExp("комбинация(.*)трусики","i"),
				new RegExp("бюстгальт(.*)стринги","i"),
				new RegExp("бюстгальт(.*)шортики","i"),
				new RegExp("пеньюар(.*)стринги","i"),
				new RegExp("платье(.*)стринги","i"),
				new RegExp("топ(.*)стринги","i"),
				new RegExp("лиф(.*)юбочка(.*)стринги","i"),
				new RegExp("лиф(.*)стринги(.*)пояс","i"),
				new RegExp("бюстик(.*)стринги(.*)пояс","i"),
				new RegExp("топ(.*)юбка(.*)стринги","i"),
				new RegExp("бюстик(.*)трусики","i"),
				new RegExp("бэби-долл(.*)стринги","i"),
				new RegExp("платье(.*)стринги","i"),
				new RegExp("бюстье(.*)трусики","i"),
				new RegExp("корсаж(.*)трусики","i"),
				new RegExp("бюст(.*)юбка","i"),
			],
//			trusiki:[
//				new RegExp("трусики","i"),
//				new RegExp("стринги","i"),
//				new RegExp("джок","i"),
//				new RegExp("шортики","i"),
//				new RegExp("танга","i"),
//				new RegExp("слипы","i"),
//				new RegExp("шорты","i"),
//				new RegExp("тр��сики","i"),
//				new RegExp("тру��ики","i"),
//				new RegExp("бикини","i"),
//			],
//			"muzhskoe-eroticheskoe-bele":[
//				new RegExp("боксеры","i"),
//				new RegExp("трусы","i"),
////				new RegExp("мужские","i"),
//				new RegExp("тонги","i"),
//				new RegExp("хипсы","i"),
//				new RegExp("борцовка","i"),
//			],
			"medsestry-i-vrachi":[
				new RegExp("медсестр","i"),
			],
			"vibrotrusiki":[
				new RegExp("вибротрусики","i"),
			],
			"trusiki-i-krepleniya":[
				new RegExp("трусики для страпона","i"),
			],
			"elektrostimulyaciya":[
				new RegExp("электростимуля","i"),
				new RegExp("электро-стимуляц","i"),
				new RegExp("электро-импульс","i"),
			],
			"povodki-i-utyazhki-na-penis":[
				new RegExp("утяжка","i"),
			],
			"pletki-i-shlepalki":[
				new RegExp("плеть","i"),
				new RegExp("плетка","i"),
				new RegExp("стек ","i"),
				new RegExp("стек, ","i"),
				new RegExp("хлопалка","i"),
				new RegExp("шлепалка","i"),
				new RegExp("шлёпалка","i"),
			],
			"klyapy":[
				new RegExp("кляп","i"),
			],
			"probki-i-vtulki":[
				new RegExp("анальная(.*)проб","i"),
				new RegExp("анальная втулка","i"),
				new RegExp("стеклянн(.*)втулка","i"),
				new RegExp("стеклянн(.*)проб","i"),
				new RegExp("анальная(.*)втулка","i"),
				new RegExp("анальная(.*)��роб","i"),
				new RegExp("втулка","i"),
				new RegExp("пробка","i"),
			],
			"vibropuli":[
				new RegExp("вибропуля","i"),
			],
			"mini-platya-i-sorochki":[
				new RegExp("мини-платье","i"),
				new RegExp("сорочка","i"),
				new RegExp("блуза","i"),
				new RegExp("комбинация","i"),
				new RegExp("комбинац��","i"),
				new RegExp("фарту","i"),
				new RegExp("бэби-долл","i"),
				new RegExp("халат","i"),
			],
			"eroticheskaya-obuv-dlya-striptiza":[
				new RegExp("босоножк","i"),
				new RegExp("сабо","i"),
				new RegExp("туфли","i"),
				new RegExp("��уфли","i"),
				new RegExp("сапоги","i"),
				new RegExp("кеды","i"),
				new RegExp("туфельки","i"),
				new RegExp("ботильон","i"),
				new RegExp("гладиаторы","i"),
				new RegExp("каблук","i"),
			],
			"chulki":[
				new RegExp("чулки","i"),
			],
			"oshejniki":[
				new RegExp("ошейник","i"),
			],
			"rasshiriteli-zazhimy-i-vytyazhki":[
				new RegExp("расширител","i"),
				new RegExp("зажим","i"),
			],
			"rotiki":[
				new RegExp("мастурбатор-ротик","i"),
				new RegExp("мастурбатор(.*)рот","i"),
				new RegExp("мастурбатор(.*)орал","i"),
				new RegExp("ротик","i"),
			],
			"shariki-cepochki-i-elochki":[
				new RegExp("ёлочка","i"),
				new RegExp("елочка","i"),
				new RegExp("анал(.*)цепоч","i"),
				new RegExp("анал(.*)шар","i"),
				new RegExp("шар(.*)анал","i"),
			],
			"stimulyaciya-prostaty":[
				new RegExp("простата","i"),
				new RegExp("простат","i"),
			],
			"naruchniki-i-fiksaciya":[
				new RegExp("наручник","i"),
				new RegExp("оковы","i"),
				new RegExp("наножник","i"),
				new RegExp("фиксатор","i"),
				new RegExp("фиксаци","i"),
				new RegExp("цепь","i"),
				new RegExp("цепи","i"),
				new RegExp("карабин","i"),
				new RegExp("веревк","i"),
				new RegExp("бондаж","i"),
				new RegExp("бандаж","i"),
			],
			"byustgaltery":[
				new RegExp("лиф","i"),
				new RegExp("бюстгальтер","i"),
				new RegExp("бюстгалтер","i"),
				new RegExp("бюстгаль��ер","i"),
				new RegExp("бюстье","i"),
				new RegExp("бюстик","i"),
			],
			"vaginalnye-shariki":[
				new RegExp("шарики(.*)вагинальные","i"),
				new RegExp("вагинальные(.*)шарики","i"),
			],
			"vibroyajca":[
				new RegExp("виброяйц","i"),
				new RegExp("вибро-яйц","i"),
			],
			"ketsyuty-chulki-na-telo":[
				new RegExp("кэтсьюит","i"),
				new RegExp("комбинезон","i"),
			],
			"vaginy":[
				new RegExp("мастурбатор(.*)вагин","i"),
				new RegExp("вагина(.*)мастурбатор","i"),
			],
			"popki":[
				new RegExp("мастурбатор(.*)поп","i"),
				new RegExp("поп(.*)мастурбатор","i"),
			],
			"vaginy-s-vibraciei":[
				new RegExp("мастурбатор(.*)вибра","i"),
				new RegExp("мастурабатор(.*)вибра","i"),
				new RegExp("вибра(.*)мастурбатор","i"),
				new RegExp("вибра(.*)вагин","i"),
				new RegExp("вагин(.*)вибра","i"),
			],
			"realistichnye":[
				new RegExp("вибратор(.*)реалисти","i"),
				new RegExp("реалисти(.*)вибратор","i"),
			],
			"nasadki-strapony-k-trusikam":[
				new RegExp("фаллоимитатор(.*)насадка(.*)страпон","i"),
				new RegExp("насадка(.*)страпон","i"),
				new RegExp("насадка(.*)трусик","i"),
				new RegExp("страпон(.*)насадка","i"),
			],
			"massazhery-dlya-tela":[
				new RegExp("вибромассажер","i"),
				new RegExp("вибромассажёр","i"),
				new RegExp("массажер","i"),
				new RegExp("массажёр","i"),
			],
			"eroticheskie-maski":[
				new RegExp("маска","i"),
			],
			"realistichnye-realistiki":[
				new RegExp("фалло(.*)реалисти","i"),
				new RegExp("реалисти(.*)фалло","i"),
			],
			"vorotnichki-i-manzhety":[
				new RegExp("манжет","i"),
			],
			"korsety":[
				new RegExp("корсет","i"),
			],
			"bodi-teddi-monokini":[
				new RegExp("боди","i"),
				new RegExp("тедди","i"),
				new RegExp("тэдди","i"),
			],
			"analnye-fallosy":[
				new RegExp("анал(.*)стимуля","i"),
				new RegExp("стимуля(.*)анал","i"),
				new RegExp("фаллоим(.*)анал","i"),
				new RegExp("анал(.*)фаллоим","i"),
			],
			"poyasa-i-podtyazhki":[
				new RegExp("пояс","i"),
			],
			"kolgotki":[
				new RegExp("колготки","i"),
				new RegExp("леггинсы","i"),
			],
			"gornichnye-sluzhanki-i-oficiantki":[
				new RegExp("официантк","i"),
				new RegExp("горничн","i"),
			],
			"shkolnicy-i-studentki":[
				new RegExp("школьниц","i"),
			],
			"analnye-vibratory":[
				new RegExp("анал(.*)вибр","i"),
				new RegExp("вибр(.*)анал","i"),
			],
			"klubnye-i-vechernie-platya":[
				new RegExp("платье","i"),
			],
			"topy-i-majki":[
				new RegExp("топ","i"),
			],
			"yubki":[
				new RegExp("юбка","i"),
				new RegExp("юбочка","i"),
			],
			"vodonepronicaemye-vibratory":[
				new RegExp("вибр(.*)водонепроницаем","i"),
				new RegExp("водонепроницаем(.*)вибр","i"),
			],
			"bryuki":[
				new RegExp("брюки","i"),
			],
			"nasadki-na-penis":[
				new RegExp("насадка(.*)пенис","i"),
			],
			"falloprotezy":[
				new RegExp("фаллопротез","i"),
				new RegExp("страпон(.*)мужчин","i"),
				new RegExp("страпон(.*)полость","i"),
			],
			"eroticheskie-igry":[
				new RegExp("игра","i"),
				new RegExp("фанты","i"),
			],
			"seks-kukly-zhenshiny":[
				new RegExp("кукла","i"),
				new RegExp("с вагиной(.*)анусом","i"),
			],
			"so-stimulyaciej-klitora":[
				new RegExp("клитор(.*)стимул","i"),
				new RegExp("стимул(.*)клитор","i"),
			],
			"analnye-grushi":[
				new RegExp("анал(.*)душ","i"),
				new RegExp("анал(.*)груша","i"),
				new RegExp("груша(.*)анал","i"),
				new RegExp("клизма","i"),
			],
			"dvuhstoronnie-dvuhgolovye":[
				new RegExp("двухсторон(.*)фалло","i"),
				new RegExp("двусторон(.*)фалло","i"),
				new RegExp("фалло(.*)двухсторон","i"),
				new RegExp("фалло(.*)двусторон","i"),
			],
			"dvustoronnie-vibratory":[
				new RegExp("двухсторон(.*)вибр","i"),
				new RegExp("двухконе(.*)вибр","i"),
				new RegExp("двуконе(.*)вибр","i"),
				new RegExp("двхсторон(.*)вибр","i"),
				new RegExp("вибр(.*)двухсторон","i"),
				new RegExp("вибр(.*)двхсторон","i"),
			],
			"masturbatory":[
				new RegExp("мастурбатор","i"),
			],
			"mnogofunkcionalnye":[
				new RegExp("многофункцион(.*)вибр","i"),
				new RegExp("вибр(.*)клиторальным отростком","i"),
			],
			"vibratory-dlya-tochki-g":[
				new RegExp("вибр(.*)точк(.*)G","i"),
			],
			"stimulyaciya-grudi":[
				new RegExp("присоск(.*)соск","i"),
				new RegExp("стимул(.*)соск","i"),
				new RegExp("зажим(.*)соск","i"),
				new RegExp("накладк(.*)соск","i"),
			],
			"neobychnie":[
				new RegExp("вибр(.*)формы","i"),
				new RegExp("вибр(.*)в форме","i"),
			],
			"neobychnoj-formy":[
				new RegExp("фалло(.*)формы","i"),
				new RegExp("фалло(.*)в форме","i"),
			],
			"vakuumnye-i-gidro-pompy":[
				new RegExp("помпа(.*)сосков","i"),
				new RegExp("помпа(.*)клитора","i"),
				new RegExp("помпа(.*)груди","i"),
				new RegExp("помпа(.*)вагин","i"),
				new RegExp("сосков(.*)вакуум","i"),
				new RegExp("вакуум(.*)клитора","i"),
				new RegExp("вакуум(.*)груди","i"),
				new RegExp("помпа(.*)женская","i"),
				new RegExp("женская(.*)помпа","i"),
			],
			"vakuumnye-pompy":[
				new RegExp("мужская помпа","i"),
				new RegExp("помпа мужская","i"),
				new RegExp("помпа(.*)мужчин","i"),
				new RegExp("вакуумная помпа","i"),
				new RegExp("помпа вакуумная","i"),
			],
			"uvelichenie-chlena":[
				new RegExp("увеличения члена","i"),
			],
			"kolca-s-vibraciej":[
				new RegExp("кольцо(.*)вибр","i"),
				new RegExp("вибр(.*)кольцо","i"),
				new RegExp("кольцо(.*)стимул","i"),
				new RegExp("стимул(.*)кольцо","i"),
			],
			"kolca-bez-vibracii":[
				new RegExp("кольц","i"),
				new RegExp("колец","i"),
			],
			"perchatki":[
				new RegExp("перчатки","i"),
			],
			"vibro-na-prisoske":[
				new RegExp("вибр(.*)на(.*)присоске","i"),
				new RegExp("на(.*)присоске(.*)вибр","i"),
			],
			"na-prisoske":[
				new RegExp("фалло(.*)присоск","i"),
				new RegExp("пенис(.*)присоск","i"),
				new RegExp("член(.*)присоск","i"),
				new RegExp("присоск(.*)фалло","i"),
				new RegExp("присоск(.*)пенис","i"),
				new RegExp("присоск(.*)член","i"),
			],
			"klassicheskie":[
				new RegExp("фалло(.*)стекл","i"),
				new RegExp("стекл(.*)фалло","i"),
			],
			"s-moshonkoj":[
				new RegExp("фалло(.*)с мошонкой","i"),
			],
			"s-moshonkoi":[
				new RegExp("вибр(.*)с мошонкой","i"),
			],
			"geli-i-masla-dlya-massazha":[
				new RegExp("масло(.*)массаж","i"),
				new RegExp("гель(.*)массаж","i"),
				new RegExp("лосьон(.*)массаж","i"),
				new RegExp("массаж(.*)масло","i"),
				new RegExp("массаж(.*)гель","i"),
				new RegExp("массаж(.*)лосьон","i"),
			],
			"svechi-dlya-massazha":[
				new RegExp("свеч(.*)массаж","i"),
				new RegExp("массаж(.*)свеч","i"),
			],
			"s-vibraciej":[
				new RegExp("страп(.*)вибр","i"),
			],
			"nakladnye-resnicy":[
				new RegExp("наклад(.*)ресниц","i"),
				new RegExp("ресниц(.*)наклад","i"),
			],
			"bezremnevye":[
				new RegExp("безремневой(.*)страпон","i"),
				new RegExp("безремневый(.*)страпон","i"),
			],
			"nakladki-na-soski-pestisy":[
				new RegExp("пэстис","i"),
				new RegExp("бра(.*)груд","i"),
			],
			"uvlazhnyayushie":[
				new RegExp("гель(.*)увлаж","i"),
				new RegExp("лубрикант(.*)увлаж","i"),
				new RegExp("смазка(.*)увлаж","i"),
				new RegExp("увлаж(.*)гель","i"),
				new RegExp("увлаж(.*)лубрикант","i"),
				new RegExp("увлаж(.*)смазка","i"),
			],
			"dlya-analnogo-seksa":[
				new RegExp("гель(.*)анал","i"),
				new RegExp("лубрикант(.*)анал","i"),
				new RegExp("смазка(.*)анал","i"),
				new RegExp("крем(.*)анал","i"),
				new RegExp("анал(.*)гель","i"),
				new RegExp("анал(.*)крем","i"),
				new RegExp("анал(.*)лубрикант","i"),
				new RegExp("анал(.*)смазка","i"),
			],
			"aromatizirovannye":[
				new RegExp("гель(.*)арома","i"),
				new RegExp("лубрикант(.*)арома","i"),
				new RegExp("смазка(.*)арома","i"),
				new RegExp("крем(.*)арома","i"),
				new RegExp("арома(.*)гель","i"),
				new RegExp("арома(.*)лубрикант","i"),
				new RegExp("арома(.*)смазка","i"),
				new RegExp("арома(.*)крем","i"),
			],
			"dlya-oralnogo-seksa":[
				new RegExp("гель(.*)орал","i"),
				new RegExp("лубрикант(.*)орал","i"),
				new RegExp("смазка(.*)орал","i"),
				new RegExp("крем(.*)орал","i"),
				new RegExp("орал(.*)гель","i"),
				new RegExp("орал(.*)лубрикант","i"),
				new RegExp("орал(.*)смазка","i"),
				new RegExp("орал(.*)крем","i"),
			],
			"vozbuzhdayushie":[
				new RegExp("гель(.*)возбужд","i"),
				new RegExp("лубрикант(.*)возбужд","i"),
				new RegExp("смазка(.*)возбужд","i"),
				new RegExp("крем(.*)возбужд","i"),
				new RegExp("возбужд(.*)гель","i"),
				new RegExp("возбужд(.*)лубрикант","i"),
				new RegExp("возбужд(.*)смазка","i"),
				new RegExp("возбужд(.*)крем","i"),
			]
		}

		var allcats = {};

		that.model("category").find(function(categories){
			categories.forEach(function(category){
				allcats[category._id] = category;
			});
			categories = allcats;

			var setCategory = function(object,catId,cb){
				var item = object.clone();
				item.ancestors = categories[catId].ancestors.clone();
				item.ancestors.push(categories[catId]._id);
				item.category = categories[catId]._id;
				that.model("product").collection().update({_id:item._id},{$set:{ancestors:item.ancestors,category:item.category}},function(err,result){
					if(typeof cb == "function"){
						cb();
					}
				});

			}

			var cursor = that.model("product").collection().find({$or:[{"ancestors":[]},{"category":""}]},{title:1,desc:1,shortDesc:1});
			cursor.count(function(err,count){
				console.log('count',count);
			})
			var iterator = 0;
			cursor.each(function(err,object){
				if(object === null){
					console.log("iterator",iterator);
				}else{
					var string = object.title + ' ' + object.shortDesc;
					object.cats = [];
					for(var catId in regs){
						regs[catId].forEach(function(reg){
							if(reg.exec(string) !== null){
								if(object.cats.indexOf(catId) < 0){
									object.cats.push(catId);
								}
							}
						})
					}
					var showAll = true,
						save = false,
						exclude = false;

					if(showAll){
						console.log(object._id, object.title, object.shortDesc, object.cats);
						iterator++;
					}else{
						if(!exclude){
							if(object.cats.length){
								iterator++;
								if(save){
									setCategory(object,object.cats[0],function(){
										console.log(object._id, object.title, object.shortDesc, object.cats);
									})
								}else{
									console.log(object._id, object.title, object.shortDesc, object.cats);
								}
							}
						}else{
							if(!object.cats.length){
								iterator++;
								console.log(object._id, object.title, object.shortDesc, object.cats);
							}
						}

					}
				}
			})
//		globalCb();
		})

	}
	
}



module.exports = ShopUpdateController;