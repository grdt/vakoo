/**
 * @constructor
 */
var ShopUpdateController = function(){
	var that = this;

	var LineByLineReader = require('line-by-line'),
		http = require('http');

	const csvLink = 'http://www.condom-shop.ru/Products/PriceList.csv';

	const filePath = './update.csv';
	
	this.priceUpdate = function(){

		var file = fs.createWriteStream(filePath);

		http.get(csvLink, function(response) {
			response.pipe(file);
			response.on('end',function(){

				that.parse();

			});
			response.on('error',function(error){
				console.log(error);
			})
		}).end();
	}


	this.parse = function(){
		var lr = new LineByLineReader(filePath, {encoding:'utf8'}),
			Iconv  = require('iconv').Iconv,
			iconv = new Iconv('UTF-8', 'CP1251'),
			mnogo = iconv.convert('Много');


		lr.on('error', function (err) {
			console.log('err',err);
		});

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

			that.model('product').where({sku: p.sku}).findOne(function(product){
				if(product._id){
					product.price = p.price;
					product.tradePrice = p.tradePrice;
					product.available = p.available;
					product.lastUpdate = new Date();
					product.save(function(){
						lr.resume();
					});
				}else{
					that.controller('import').getProduct(p.sku,function(product){
						
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

							if(!product.image && !product.images.length){
								product.save(function(){
									lr.resume();
								});
								return;
							}

							if(product.image){
								var file = that.option('file').model('file');
								file.loadFromSource(product.image,product.alias,function(file){
									file.save(function(){
										product.image = {
											id:file._id,
											name:file.name,
											alt:product.title,
											path:file.path
										}

										if(!product.images.length){
											product.save(function(){
												lr.resume();
											});
										}else{
											if(allUpload){
												product.save(function(){
													lr.resume();
												});
											}else{
												mainUpload = true;
											}
										}

									});
								});
							}else{
								mainUpload = true;
							}

							if(product.images.length){
								product.images.forEach(function(image,i){
									var file = that.option('file').model('file');
									file.loadFromSource(product.image + '-' + i,product.alias,function(file){
										file.save(function(){
											product.images[i] = {
												id:file._id,
												name:file.name,
												alt:product.title,
												path:file.path
											}

											if(i == (product.images.length - 1)){
												if(mainUpload){
													product.save(function(){
														lr.resume();
													});
												}else{
													allUpload = true;
												}
											}
										});
									});
								});
							}else{
								allUpload = true;
							}

						});

						

					});
				}
			});

		});

		lr.on('end', function () {
			fs.unlink(filePath);
		});
	}
	
}



module.exports = ShopUpdateController;