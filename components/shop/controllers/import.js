var xml2js = require('xml2js');

var Import = function(){
	var $c = this, 
		that = this;

	var startTime = new Date();

	this.timedOut = {};

	this.index = function(){

		var skus = fs.readFileSync(that.APP_PATH + '/sku.txt').toString().split('\n');

		var already = [];
		
		var added = [];

		this.model('product').find(function(products){
			products.forEach(function(product){
				already[parseInt(product.sku)] = true;
			});

			skus.forEach(function(sku){
				if(typeof already[parseInt(sku)] == "undefined"){
					that.getProduct(sku);
				}else{
					added.push(sku);
				}
			});
			
			console.log('already added',added.join(','));
		});

//		skus.forEach(function(sku){
//			that.model('product').where({sku:parseInt(sku)}).findOne(function(product){
//				if(!product._id){
////					console.log('start get',sku);
//					that.getProduct(sku);
//				} else {
//					console.log(sku,'already added');
//				}
//			});
//		});
	}

	this.getProduct = function(sku,done){
		var http = require('http');
		var options = {
			host: 'www.condom-shop.ru',
			port: '80',
			path: '/products/' + sku,
			method: 'POST',
			headers: {
				'Cookie': 'sid=6fdfbfa5bb472f77925d581e95f0a649',
			}
		};

		var req = http.request(options,function(res){

			var result = '';

			res.on('data',function(chunk){
				result = result + chunk;
			});

			res.on('end',function(){
				var jsdom  = require('jsdom');
				var fs     = require('fs');
				var jquery = fs.readFileSync(that.APP_PATH + '/public/js/jquery.js').toString();
				jsdom.env({
					html:result,
					src:[jquery],
					done:function(error,window){
						if(error){
							console.log(error.code);
							return;
						}

						var $ = window.$;

						that.storeProduct($,done);
					}
				})
			});
		});

		req.on('socket', function (socket) {
			socket.setTimeout(5000);
			socket.on('timeout', function() {
				req.end();
				console.log('product',sku,'timeout, again .... ');
				that.getProduct(sku,done);
				return;
				if(typeof that.timedOut[sku] == "undefined"){
					that.timedOut[sku] = true;
					that.getProduct(sku,done);
					console.log('product',sku,'timeout, get again');
				}else{
					console.log('product',sku,'timeout, close');
				}
			});
		});

		req.end();
	};

	this.storeProduct = function($, done){


		var product = that.model('product');

		if($(".message.error").length){
			if(typeof done == "function"){
				done(false);
			}
			return;
		}


		product.sku = parseInt($("#article").html().replace('Артикул: ',''));
		product.tradePrice = parseInt($(".regular-price").html());
		product.price = parseInt($(".price-wholesale").html().replace('РРЦ: ',''));
		product.available = $("#status").html();



		product.title = $("#name").html().trim();
		product.shortDesc = $("#sub_name").html().trim();
		product.alias = translit(product.title);
		product.params = {
			benefits:[],
			items:[]
		};

		$("#descriptions p").each(function(i,p){
			product.desc += '<p>' + $(p).html().trim() + '</p>';
		});

		$("#benefits ul li").each(function(i,li){
			var $li = $(li);
			$li.find('span').remove();
			product.params.benefits.push($li.html().trim());
		});

		$("#propertys ul li").each(function(i,li){
			var name = $(li).find('.name>span').html().trim();
			var value = $(li).find('.value').html().trim();
			product.params.items.push([name,value]);
		});

		if($("#groups").size()){
			if($("#groups a").size()){
				product.size.current = $("#groups>form>div>span").html().replace('размер','').trim();
				$("#groups a").each(function(i,a){
					var size = $(a).find('div>span').html().replace('размер','').trim();
					if(size.indexOf('.') >= 0){
						product.size = false;
						product.group.current = $('#groups>form>div>span').html().trim();
						product.group.groups.push(
							{group:size,sku:1*$(a).attr('href').replace('http://www.condom-shop.ru/products/','')}
						)
					}else{
						product.group = false;
						product.size.sizes[size] = {sku:1*$(a).attr('href').replace('http://www.condom-shop.ru/products/','')};
					}
				});
			}else{
				product.size.current = 'XS-L';
			}
		}else{
			product.size = false;
		}

		if(product.group.isEqual({current:"",groups:[]})){
			product.group = false;
		}

		$("#videos a").each(function(i,a){
			product.videos.push($(a).attr('href'));
		});

		product.image = $("#main-image>img").attr('src');

		product.images = [];

		$("#images #more-views ul li a img").each(function(i,img){
			if($(img).attr('src') != product.image){
				product.images.push($(img).attr('src'));
			}
		});

		if(typeof done == "function"){
			done(product);
		}else{
			this.addToStack(product);
			var memory = process.memoryUsage();
			console.log('memory', memory.rss / 1024 / 1024);
		}
	}
	
	this.stack = [];

	this.stackSchedule = false;
	
	this.addToStack = function(product){
		console.log('add to stack',product.sku);
		this.stack.push(product.clean('_id'));
		if(this.stack.length >= 10 && !this.stackSchedule){
			this.stackSchedule = this.stack.clone();
			this.stack = [];
			console.log('stackoverflow, inserting');
			this.model('product').collection().insert(this.stackSchedule,function(err,items){
				if(err){
					console.log(err);
				}else{
					console.log(items.length,'inserted');
					if(items.length == that.stackSchedule.length){
						that.stackSchedule = false;
					}else{
						console.log('ERRRORRR!!!! WTFFFFF!!!');
					}
				}
			});
		}
	}
	
	this.index2 = function(){

		this.where();
		return;

		var url = 'http://www.condom-shop.ru/products/35566';
		var jsdom  = require('jsdom');
		var fs     = require('fs');
		var jquery = fs.readFileSync(this.APP_PATH + '/public/js/jquery.js').toString();
		
		console.log('sid = 74efb67761f6f754643b4824297d5be4; expires = '+(new Date(2015, 4, 23, 16, 53, 37)).toUTCString()+'; path=/; domain = .condom-shop.ru');
		
		jsdom.env({
			url:url,
			src:[jquery],
			document:{
				referrer:'http://www.condom-shop.ru/eroticheskoe-belie-i-odezhda/kiss-me-gogo-girl-belyj-otkrytyj-byustik-stringi-poyas-i-podvyazka',
				cookie:'sid=74efb67761f6f754643b4824297d5be4; Expires = '+(new Date(2015, 4, 23, 16, 53, 37)).toUTCString()+'; Path=/; Domain = .condom-shop.ru'
			},
			done:function(error,window){
				if(error){
					console.log(error.code);
					return;
				}

				var $ = window.$;
				
				console.log($("#prices").html());
				
			}
		});

		this.where();


		return;
		var csv = require('csv');

		var Buffer = require('buffer').Buffer;
		var Iconv  = require('iconv').Iconv;
		var assert = require('assert');

		var iconv = new Iconv('UTF-8', 'CP1251');
		
		var skus = [];
		
		this.model('product').find(function(products){
			products.forEach(function(p){
				skus.push(p.sku);
			});

			csv()
				.from.path(this.APP_PATH + '/PriceList-3.csv',{delimiter:';'})
				.to.array(function(data){
					for(var key in data){
						if(key != 0 && key > 3000 && key < 3002){
							if(skus.indexOf(data[key][0])*1 == -1){
								var product = that.model('product');
								var sku = data[key][0];
								var memory = process.memoryUsage();
								var tradePrice = data[key][1];
								var price = data[key][2];
								var buffer = iconv.convert('Много');
								if(buffer.toString() == data[key][4]){
									product.available = true;
								}
								product.sku = sku;
								product.tradePrice = tradePrice;
								product.price = price;
								that.parseProduct(product,key,function(){
									product = null;
								});
							}else{
								
							}


						}
					}
				});
			
		});
		


		this.where();
		
		return;

		
	}

	this.parseProduct = function(product,i,done){
		var url = 'http://www.condom-shop.ru/products/' + product.sku;
		var jsdom  = require('jsdom');
		var fs     = require('fs');
		var jquery = fs.readFileSync(this.APP_PATH + '/public/js/jquery.js').toString();
		jsdom.env({
			url:url,
			src:[jquery],
			document:{
				cookie:'sid=74efb67761f6f754643b4824297d5be4; expires=Sat, 23 2015 16:53:37 GMT+4; path=/',
				cookieDomain:'.condom-shop.ru'
			},
			done:function(error,window){
				if(error){
					console.log(error.code,i,product.sku);
					return;
				}

				var $ = window.$;
				
				product.title = $("#name").html().trim();
				product.shortDesc = $("#sub_name").html().trim();
				product.alias = translit(product.title);
				product.params = {
					benefits:[],
					items:[]
				};

				$("#descriptions p").each(function(i,p){
					product.desc += '<p>' + $(p).html().trim() + '</p>';
				});

				$("#benefits ul li").each(function(i,li){
					var $li = $(li);
					$li.find('span').remove();
					product.params.benefits.push($li.html().trim());
				});

				$("#propertys ul li").each(function(i,li){
					var name = $(li).find('.name>span').html().trim();
					var value = $(li).find('.value').html().trim();
					product.params.items.push([name,value]);
				});

				if($("#groups").size()){
					if($("#groups a").size()){
						product.size.current = $("#groups>form>div>span").html().toLowerCase().replace('размер','').trim().toUpperCase();
						$("#groups a").each(function(i,a){
							var size = $(a).find('div>span').html().toLowerCase().replace('размер','').trim().toUpperCase();
							if(size.indexOf('.') >= 0){
								product.size = false;
								product.group.current = $(a).find('div>span').html().toLowerCase().replace('размер','').trim().toUpperCase();
								product.group.groups.push(
									{group:size,sku:1*$(a).attr('href').replace('http://www.condom-shop.ru/products/','')}
								)
							}else{
								product.group = false;
								product.size.sizes[size] = {sku:1*$(a).attr('href').replace('http://www.condom-shop.ru/products/','')};
							}
						});
					}else{
						product.size.current = 'XS-L';
					}
				}else{
					product.size = false;
				}

				$("#videos a").each(function(i,a){
					product.videos.push($(a).attr('href'));
				});

				product.image = $("#main-image>img").attr('src');

				$("#images #more-views ul li a img").each(function(i,img){
					if($(img).attr('src') != product.image){
						product.images.push($(img).attr('src'));
					}
				});
				
				product.save();

				console.log('product save.',i,' sku:',product.sku,'time',((new Date).getTime() - startTime.getTime()) / 1000);
				var memory = process.memoryUsage();
				console.log('memory', memory.rss / 1024 / 1024);

				done();

				delete jsdom;
			}
		});

		this.where();
	}

	this.products = function(){

		var parser = new xml2js.Parser();


		fs.readFile(this.APP_PATH + '/export_yml.xml', function(err, data) {
			parser.parseString(data, function (err, result) {
				result.yml_catalog.shop[0].offers[0].offer.forEach(function(offer){

					var product = $c.model('product');
					var category = $c.model('category');
					
					product.import.id = parseInt(offer.$.id);
					product.import.categoryId = parseInt(offer.categoryId[0]);
					
					product.title = offer.name[0];
					
					product.price = parseInt(parseFloat(offer.price[0]));

					product.sku = offer.vendorCode[0];

					product.image = offer.picture[0];

					product.desc = offer.description[0];

					product.alias = translit(product.title);

					if(offer.$.available != 'true'){
						product.status = 'dried';
					}
					offer.param.forEach(function(param){
						product.params.push({
							name:param.$.name,
							value:param._
						});	
					});
					
					category.where({'import.id':product.import.categoryId}).findOne(function(category){
						product.category = category._id;
						product.save();
					})
				});
			});
		});
		this.where();
	}

	this.categories = function(){

		var parser = new xml2js.Parser();

		fs.readFile(this.APP_PATH + '/export_yml.xml', function(err, data) {
			parser.parseString(data, function (err, result) {
				console.log(result.yml_catalog.shop[0].categories[0].category.length);

				var categories = [];

				result.yml_catalog.shop[0].categories[0].category.forEach(function(cat){
					var category = $c.model('category');
					var model = $c.model('category');
					if(typeof cat.$.parentId != "undefined"){
						category.import.parent_id = parseInt(cat.$.parentId);
					}

					category.import.id = parseInt(cat.$.id);
					
					category.title = cat._;

					category.createId();

					categories.push(category);

				});
				
				categories.forEach(function(category){
					if(category.import.parent_id != 0){
						var parent;
						categories.forEach(function(cat){
							if(cat.import.id == category.import.parent_id){
								parent = cat;
							}	
						});
						var anc = parent.ancestors.clone();
						anc.push(parent._id);
						category.parent = parent._id;
						category.ancestors = anc;
					}

//					console.log(category.clean());

					category.insert(function(res){
						if(!res){
							category._id += '-' + category.import.id;
							category.insert();
						}
					});
				});
				
			});
		});

		this.where();
	}

}


module.exports = Import;