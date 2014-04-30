var Controller = function(){
	var $c = this;

	this.coords = function(){
		if(this.post()){
			var lat = this.post('lat');
			var lng = this.post('lng');
			$c.model('city').byCoords({lat:lat,lng:lng}).findOne(function(city){
				if(city._id){
					$c.json('Поймал! Ты из '+city.title_from+'!');
				}else{
					$c.json('Один фиг не нашли =/');
				}
			})
		}else{
			this.where();
		}

	}

	this.index = function(){

		//{"loc":{"$near":[53.182612460368276, 56.879352315243075]}}

		var ip = this.url.request.headers['x-forwarded-for'] || this.url.request.connection.remoteAddress;

		$c.model('city').byIP(ip).findOne(function(city){

			var msg = '';

			if(city._id){
				msg = 'Дарова. Походу ты из '+city.title_from+' и твой айпишник '+ip+' а координаты я тебе не скажу =Р';
			}else{
				msg = 'Мы не нашли город по твоему IP =/ Щас попробуем по координатам.';
			}

			$c.tmpl().display('geo',{
				msg:msg
			});return;
			if(!city._id){
				$c.display('geo');
			}else{
				$c.json('Дарова. Походу ты из '+city.title_from+' и твой айпишник '+ip+' а координаты я тебе не скажу =Р');
			}

		});

		return;

		$c.model('city').find(function(cities){
			cities.forEach(function(city,i){
				if(city.block && city.block.length){
					city.block.forEach(function(block){
						block.begin_ip = parseInt(block.begin_ip);
						block.end_ip = parseInt(block.end_ip);
					});
				}

				city.loc.lat = city.latitude;
				city.loc.lng = city.longitude;

				city.save();
			})
		});

		this.where();
	}

	this.storeTitles = function(){
		var csv = require('csv');
		var temp_cities = [];


		csv()
			.from.path('/home/pasa/vakoo/cities.csv')
			.to.array(function(data){

				data.forEach(function(item,i){
					temp_cities.push(_.object(data[0],item));
				});

				temp_cities.forEach(function(city){
					$c.model('city').where({name_ru:city.name}).find(function(models){
						if(models){

							models.forEach(function(item){
								item.title_from = city.genitiveСase;
								item.title_in = city.prepositionalCase;
								item.save();
							});
						}
					});
				})

			});

		this.where();
	}



	this.storeCity = function(){

		var csv = require('csv');
		var temp_cities = [];
		var cities = [];
		
		var temp_blocks = [];


		csv()
			.from.path('/home/pasa/vakoo/net_city_view.csv')
			.to.array(function(data){
				
				data.forEach(function(item,i){
					temp_cities.push(_.object(data[0],item));
				});


				for(key in temp_cities){
					if(temp_cities[key].id){
						cities[temp_cities[key].id] = temp_cities[key];
					}
				}

				csv()
					.from.path('/home/pasa/vakoo/query_result.csv')
					.to.array(function(data){
						data.forEach(function(block,i){
							temp_blocks.push(_.object(data[0],block));
						});
					
						temp_blocks.forEach(function(block){
							if(typeof cities[block.city_id] != "undefined"){
								if(typeof cities[block.city_id].blocks == "undefined"){
									cities[block.city_id].blocks = [];
								}
								cities[block.city_id].blocks.push({begin_ip:block.begin_ip,end_ip:block.end_ip});
							}else{
								console.log('undef city',block.city_id);
							}	
						});
						
						cities.forEach(function(city,i){
							if(typeof city != "undefined"){
								var model = $c.model('city');
								model.cid = city.id;
								model.block = city.blocks;
								model.name_ru = city.name_ru;
								model.name_en = city.name_en;
								model.region = city.region;
								model.latitude = city.latitude;
								model.longitude = city.longitude;
								model.save();
							}
						})
					})

			})

		this.where();
	}
}


module.exports = Controller;