var async = require("async")
var Controller = function(){
	var $c = this,
		that = this;

	this.getPosition = function(){
		var lat = this.get('lat'),
			lng = this.get('lng'),
			ip = this.query.request.headers['x-forwarded-for'] || this.query.request.connection.remoteAddress,
			result = {};

		this.model('city').byIP(ip).find(function(byIp){
			if(byIp.length){
				byIp.forEach(function(city){
					result[city.alias] = city.short();
				})
			}
			if(lat && lng){
				that.model('city').byCoords({lat:lat,lng:lng}).findOne(function(byCoords){
					if(byCoords._id){
						result[byCoords.alias] = byCoords.short();
					}

					that.json(result);

				});
			}else{
				that.json(result);
			}
		});

	}

    var sortLocations = function(locations, lat, lng) {
        function dist(l) {
            return (l.latitude - lat) * (l.latitude - lat) +
                (l.longitude - lng) * (l.longitude - lng);
        }

        locations.sort(function(l1, l2) {
            return dist(l1) - dist(l2);
        });
    }
	
	this.choose = function(){
		this.model('city').where({alias:{$in:this.get('aliases')},status:'active'}).find(function(finded){

			var data = {cities:{}};

			if(finded.length){
				finded.forEach(function(city){
					data.cities[city.alias] = city.short();
				})
			}

			that.model('city').byIP(that.query.request.headers['x-forwarded-for'] || that.query.request.connection.remoteAddress).findOne(function(findedByIp){
				if(that.get('lat') && that.get('lng')){
					that.model('city').byCoords({lat:that.get('lat'),lng:that.get('lng')}).limit(3).find(function(findedByCoords){

						if(findedByCoords.length){
                            sortLocations(findedByCoords, parseFloat(that.get('lat')), parseFloat(that.get('lng')));
							findedByCoords.forEach(function(city){
								data.cities[city.alias] = city.short();
							})
						}

						if(findedByIp._id){
							data.cities[findedByIp.alias] = findedByIp.short();
						}

						var citiesLength = 0;
						for(var key in data.cities){
							if(citiesLength === 0){
								data.city = data.cities[key];
							}
							citiesLength++;
						}
						if(citiesLength == 1){
							data.cities = null;
						}else{
							delete data.cities[data.city.alias];
						}
						that.json(data);
					});
				}else{
					if(findedByIp._id){
						data.cities[findedByIp.alias] = findedByIp.short();
					}
					var citiesLength = 0;
					for(var key in data.cities){
						if(citiesLength === 0){
							data.city = data.cities[key];
						}
						citiesLength++;
					}
					if(citiesLength == 1){
						data.cities = null;
					}else if (data.city && data.city.alias){
						delete data.cities[data.city.alias];
					}
					that.json(data);
				}
			});

		});
	}

	this.search = function(){
		var result = [];
		this.model('city').where({status:'active',name_ru:new RegExp(this.get('term'),'i')}).find(function(cities){
			cities.forEach(function(city){
				result.push(city.short());
			});
			that.json(result);
		});
	}

	
	/* not actual */

	this.storedata = function(){
		if(this.post()){
			this.model('city').where({_id:this.post('id')}).findOne(function(city){

				city.data = $c.post('data');

				city.save();

				$c.json(city.clean('block'));
			});
		}
	}

	this.store = function(){
		if(this.post()){
			this.model('city').where({_id:this.post('id')}).findOne(function(city){
//				city.title_from = $c.post('from');
//				city.title_in = $c.post('in');
//				city.save();
//				console.log('save',city._id,city.clean('block'));
				$c.json(city.clean('block'));
			});


		}
	}

	this.remove = function(){
		if(this.post()){
			this.model('city').where({_id:this.post('id')}).findOne(function(city){
				city.status = $c.post('status');
				city.save();
				$c.json(city.clean('block'));
			});
		}
	}

	this.index = function(){
		this.model('city').where({status:'active'}).find(function(cities){
			var cities2 = [];

			cities.forEach(function(city){
				if(city.name_ru != city.data.city){
					cities2.push(city);
				}
			});

			console.log(cities2.length);


			$c.tmpl().display('cities2',{cities:cities2});
		})
	}
	
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

	this.getLocation = function(){

		//{"loc":{"$near":[53.182612460368276, 56.879352315243075]}}

		var ip = this.query.request.headers['x-forwarded-for'] || this.query.request.connection.remoteAddress;

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