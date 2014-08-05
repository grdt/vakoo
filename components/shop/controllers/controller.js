var Controller = function(){

	var that = this;

	this.index = function(){
		this.model('category').find(function(categories){
			that.tmpl().display('main');
		});
	}

	this.sitemap = function(){
		
		var host = this.query.getHost(),
			root = 'http://' + host,
			xmlObj = function(object){
				var res = '<url>';
				for(var key in object){
					if(object[key] instanceof Date){
						var date = new Date(object[key].toString());
						object[key] = date.getFullYear() + '-' + (date.getMonth()+1 < 10 ? '0' + (date.getMonth()+1) : date.getMonth()+1) + '-' + ((date.getDate() < 10) ? '0' + date.getDate() : date.getDate());
					}
					res += '<' + key + '>';
					res += object[key];
					res += '</' + key + '>';
				}
				res += '</url>';
				return res;
			};

		this.query.response.setHeader('Content-type','text/xml');

		var xml = '<?xml version="1.0" encoding="UTF-8"?>' + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

		this.model('category').find(function(categories){
			categories.forEach(function(category){
				xml += xmlObj({
					loc:root + category.url(),
					changefreq:'weekly'
				});
			});

			that.model('product').where({status:'active'}).find(function(products){
				products.forEach(function(product){
					xml += xmlObj({
						loc:root + product.url(),
						lastmod:product.lastUpdate,
						changefreq:'weekly'
					});
				});

				that.echo(xml + '</urlset>');
			});
		});

//		for(var i=0; i<=10;i++){
//			xml += xmlObj({
//				loc:root + '/aza',
//				lastmod:new Date(),
//				changefreq:'weekly',
//				priority:0.8
//			});
//		}

	}

}


module.exports = Controller;