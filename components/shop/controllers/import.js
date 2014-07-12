var xml2js = require('xml2js');

var Import = function(){
	var $c = this, 
		that = this;

	var startTime = new Date();
	
	this.index = function(){
		var csv = require('csv');

		var Buffer = require('buffer').Buffer;
		var Iconv  = require('iconv').Iconv;
		var assert = require('assert');

		var iconv = new Iconv('UTF-8', 'CP1251');

		csv()
			.from.path('/home/pasa/vakoo/PriceList-2.csv',{delimiter:';'})
			.to.array(function(data){
				for(key in data){
					if(key != 0 && key > 2139 && key < 10000){
						var sku = data[key][0];
						var tradePrice = data[key][1];
						var price = data[key][2];
						var product = that.model('product');
						var buffer = iconv.convert('Много');
						if(buffer.toString() == data[key][4]){
							product.available = true;
						}
						product.sku = sku;
						product.tradePrice = tradePrice;
						product.price = price;
						that.parseProduct(product,key,function(){
							product = null;
							delete data[key];
						});

					}
				}
			});
	}

	this.parseProduct = function(product,i,done){
		var url = 'http://www.condom-shop.ru/products/' + product.sku;
//		console.log('start parse product',i,url);
		var jsdom  = require('jsdom');
		var fs     = require('fs');
		var jquery = fs.readFileSync(this.APP_PATH + '/public/js/jquery.js').toString();


		jsdom.env({
			url:url,
			src:[jquery],
			done:function(error,window){
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

				done();
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