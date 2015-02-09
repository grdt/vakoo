var Controller = function(){

	var that = this;

	this.index = function(){
		this.option('content').model('page').where({alias:'main'}).findOne(function(page){
			that.model('category').where({main:true}).find(function(categories){

				var categoriesObject = {
					"dlya-nee":{
						bg:3,
						color:'gray'
					},
					"dlya-nego":{
						bg:'000',
						color:'light'
					},
					"dlya-dvoih":{
						bg:3,
						color:'gray'
					},
					"eroticheskaya-odezhda-i-bele":{
						bg:'000',
						color:'light'
					},
					"fetish-i-bdsm":{
						bg:3,color:'gray'
					}
				};

				categories.forEach(function(category){
					categoriesObject[category._id].category = category;
				})

				that.model('product').where({isNew:true,available:true}).limit(4).find(function(newcomers){
					that.tmpl().display('main_page',{
						title:page.meta.title,
						page:page,
						meta:page.meta,
						partial:{city:that.query.city},
						categories:categoriesObject,
						newcomers:newcomers
					});
				})
			});
		});
	}

	this.sitemap = function(){
		this.cleanTimeout();
		var host = this.query.getHost(),
			root = 'http://' + host,
			xmlObj = function(object){
				var res = '<url>';
				for(var key in object){
					if(object[key] instanceof Date){
						var date = new Date(object[key].toString());
						object[key] = date.getFullYear() + '-' + (date.getMonth()+1 < 10 ? '0' + (date.getMonth()+1) : date.getMonth()+1) + '-' + ((date.getDate() < 10) ? '0' + date.getDate() : date.getDate());
					}
					if(object[key] !== false){
						res += '<' + key + '>';
						res += object[key];
						res += '</' + key + '>';
					}
				}
				res += '</url>';
				return res;
			};

		var xml = '<?xml version="1.0" encoding="UTF-8"?>' + '\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

		if(this.get('type') == 'categories'){
			this.model('category').find(function(categories){
				categories.forEach(function(category){
					xml += xmlObj({
						loc:root + category.url(),
						changefreq:'weekly'
					});
				});

				that.query.response.end(xml + '</urlset>');
			});
		}

		if(this.get('type') == 'products'){

			var limit = this.get('limit');

			var perPage = 2000;

			var model = this.model('product').where({status:'active'});

			if(limit){
				model.limit(limit * perPage, perPage);
			}
			

			model.find(function(products){
				products.forEach(function(product){
					xml += xmlObj({
						loc:root + product.url(),
						lastmod:product.lastUpdate,
						changefreq:'weekly'
					});
				});

				that.query.response.end(xml + '</urlset>');
			});
		}

		if(this.get('type') == 'articles'){

			var model = this.option('content').model('page');

			model.find(function(pages){
				pages.forEach(function(page){
					xml += xmlObj({
						loc:root + page.url(),
						lastmod:page.publish,
						changefreq:'weekly'
					});
				});

				that.query.response.end(xml + '</urlset>');
			});
		}
	}

}


module.exports = Controller;