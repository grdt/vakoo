var xml2js = require('xml2js');

var Import = function(){
	$c = this;

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