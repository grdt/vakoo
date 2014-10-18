/**
 * @constructor
 * @extends CoreAdminController
 */
var FileIndexController = function(){

	var that = this;

	this.robots = function(){



		this.cleanTimeout();

		var mimeTypes = {
			"html": "text/html",
			"jpeg": "image/jpeg",
			"jpg": "image/jpeg",
			"png": "image/png",
			"js": "text/javascript",
			"css": "text/css",
			"txt": "text/plain"
		};

		this.query.response.writeHead(200,{'Content-Type':mimeTypes.txt});
		var name = (this.vakoo.isProduction()) ? 'prod-robots.txt' : 'dev-robots.txt';
		var fileStream = fs.createReadStream(this.APP_PATH + this.SEPARATOR + 'public' + this.SEPARATOR + name);

		if(this.vakoo.isProduction()){
			
			var res = 'User-agent: *\n'+
				'Allow: /\n'+
				'Sitemap: http://'+this.query.getHost()+'/sitemap-categories.xml\n' +
				'Sitemap: http://'+this.query.getHost()+'/sitemap-articles.xml';
			
			this.option('shop').model('product').where({status:'active'}).count(function(count){
				var pages = parseInt(count / 2000) + 1;
				for(var i = 1; i <= pages; i++){
					res += '\nSitemap: http://'+that.query.getHost()+'/sitemap-products'+i+'.xml'
				}

				that.query.response.end(
					res
				);
			})
		}else{
			fileStream.pipe(this.query.response);
		}

	}

	this.yaVerify = function(){
		fs.openSync(this.vakoo.PUBLIC_PATH + '/yandex/yandex_' + this.get('id') + '.txt', 'w');
		this.redirect('/yandex_' + this.get('id') + '.txt');
	}
}


module.exports = FileIndexController;