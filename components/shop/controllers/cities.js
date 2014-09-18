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
					}else{
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


	var links = ['kuzneck.luxy.sexy',
		'kislovodsk.luxy.sexy',
		'vorkuta.luxy.sexy',
		'angarsk.luxy.sexy',
		'nalchik.luxy.sexy',
		'belaya-kalitva.luxy.sexy',
		'nefteyugansk.luxy.sexy',
		'luchegorsk.luxy.sexy',
		'korsakov.luxy.sexy',
		'tynda.luxy.sexy',
		'yakovlevka.luxy.sexy',
		'vrangel.luxy.sexy',
		'pos-lesnoj.luxy.sexy',
		'rezh.luxy.sexy',
		'istra.luxy.sexy',
		'strezhevoj.luxy.sexy',
		'zarechnyj.luxy.sexy',
		'nizhnij-tagil.luxy.sexy',
		'bolshoj-kamen.luxy.sexy',
		'leninsk.luxy.sexy',
		'ramenskoe.luxy.sexy',
		'balakovo.luxy.sexy',
		'dalnerechensk.luxy.sexy',
		'zhigulevsk.luxy.sexy',
		'syzran.luxy.sexy',
		'pushkino.luxy.sexy',
		'dalnegorsk.luxy.sexy',
		'dzerzhinskij.luxy.sexy',
		'balashov.luxy.sexy',
		'buzuluk.luxy.sexy',
		'protvino.luxy.sexy',
		'reutov.luxy.sexy',
		'tihvin.luxy.sexy',
		'apatity.luxy.sexy',
		'lebedyan.luxy.sexy',
		'arzamas.luxy.sexy',
		'anadyr.luxy.sexy',
		'himki.luxy.sexy',
		'sarov.luxy.sexy',
		'zhukovka.luxy.sexy',
		'aniva.luxy.sexy',
		'ussurijsk.luxy.sexy',
		'elista.luxy.sexy',
		'roslavl.luxy.sexy',
		'kandalaksha.luxy.sexy',
		'kineshma.luxy.sexy',
		'millerovo.luxy.sexy',
		'skala.luxy.sexy',
		'kumertau.luxy.sexy',
		'komsomolsk-na-amure.luxy.sexy',
		'novokubansk.luxy.sexy',
		'borisoglebsk.luxy.sexy',
		'dmitrov.luxy.sexy',
		'kirovo-chepeck.luxy.sexy',
		'kronshtadt.luxy.sexy',
		'tejkovo.luxy.sexy',
		'shuya.luxy.sexy',
		'gelendzhik.luxy.sexy',
		'otradnyj.luxy.sexy',
		'beloreck.luxy.sexy',
		'sayanogorsk.luxy.sexy',
		'monchegorsk.luxy.sexy',
		'salavat.luxy.sexy',
		'kavalerovo.luxy.sexy',
		'plastun.luxy.sexy',
		'primorsk.luxy.sexy',
		'hanty-mansijsk.luxy.sexy',
		'chehov.luxy.sexy',
		'navashino.luxy.sexy',
		'gukovo.luxy.sexy',
		'usinsk.luxy.sexy',
		'murom.luxy.sexy',
		'pavlovo.luxy.sexy',
		'ishimbaj.luxy.sexy',
		'gagarin.luxy.sexy',
		'megion.luxy.sexy',
		'kansk.luxy.sexy',
		'petrovo-dalnee.luxy.sexy',
		'divnogorsk.luxy.sexy',
		'aksai.luxy.sexy',
		'volsk.luxy.sexy',
		'neftekamsk.luxy.sexy',
		'zavolzhe.luxy.sexy',
		'aprelevka.luxy.sexy',
		'zhukovskij.luxy.sexy',
		'kodinsk.luxy.sexy',
		'novouralsk.luxy.sexy',
		'noginsk.luxy.sexy',
		'nizhnevartovsk.luxy.sexy',
		'anapa.luxy.sexy',
		'kotovo.luxy.sexy',
		'beslan.luxy.sexy',
		'bronnicy.luxy.sexy',
		'preobrazhenskaya.luxy.sexy',
		'chudovo.luxy.sexy',
		'sosnovoborsk.luxy.sexy',
		'zima.luxy.sexy',
		'shatura.luxy.sexy',
		'novocherkassk.luxy.sexy',
		'aldan.luxy.sexy',
		'tuapse.luxy.sexy',
		'belovo.luxy.sexy',
		'noyabrsk.luxy.sexy',
		'tobolsk.luxy.sexy',
		'gorodec.luxy.sexy',
		'georgievsk.luxy.sexy',
		'groznyj.luxy.sexy',
		'azov.luxy.sexy',
		'odincovo.luxy.sexy',
		'kolomna.luxy.sexy',
		'krasnokamsk.luxy.sexy',
		'vinogradov.luxy.sexy',
		'volokolamsk.luxy.sexy',
		'lesozavodsk.luxy.sexy',
		'aleksandrov.luxy.sexy',
		'budennovsk.luxy.sexy',
		'sovetskij.luxy.sexy',
		'vihorevka.luxy.sexy',
		'zarinsk.luxy.sexy',
		'novoshahtinsk.luxy.sexy',
		'nevinnomyssk.luxy.sexy',
		'rybinsk.luxy.sexy',
		'uglich.luxy.sexy',
		'balabanovo.luxy.sexy',
		'zvenigorod.luxy.sexy',
		'boguchar.luxy.sexy',
		'kopejsk.luxy.sexy',
		'ipatovo.luxy.sexy',
		'batajsk.luxy.sexy',
		'zernograd.luxy.sexy',
		'nizhneudinsk.luxy.sexy',
		'uren.luxy.sexy',
		'zheleznovodsk.luxy.sexy',
		'vanino.luxy.sexy',
		'berezniki.luxy.sexy',
		'atkarsk.luxy.sexy',
		'novopavlovsk.luxy.sexy',
		'ocher.luxy.sexy',
		'vyksa.luxy.sexy',
		'bogorodsk.luxy.sexy',
		'gremyachinsk.luxy.sexy',
		'slavyansk-na-kubani.luxy.sexy',
		'kachkanar.luxy.sexy',
		'klimovsk.luxy.sexy',
		'solikamsk.luxy.sexy',
		'ternej.luxy.sexy',
		'yagodina.luxy.sexy',
		'ust-kut.luxy.sexy',
		'nikolaevsk.luxy.sexy',
		'amursk.luxy.sexy',
		'chernushka.luxy.sexy',
		'elektrostal.luxy.sexy',
		'krasnoturinsk.luxy.sexy',
		'revda.luxy.sexy',
		'kolchugino.luxy.sexy',
		'vsevolozhsk.luxy.sexy',
		'bogdanovich.luxy.sexy',
		'zheleznodorozhnyj.luxy.sexy',
		'satka.luxy.sexy',
		'asha.luxy.sexy',
		'neftegorsk.luxy.sexy',
		'timashevsk.luxy.sexy',
		'suzdal.luxy.sexy',
		'skovorodino.luxy.sexy',
		'volzhsk.luxy.sexy',
		'sokolov.luxy.sexy',
		'kizlyar.luxy.sexy',
		'naro-fominsk.luxy.sexy',
		'sortavala.luxy.sexy',
		'yaransk.luxy.sexy',
		'kizel.luxy.sexy',
		'gornozavodsk.luxy.sexy',
		'kungur.luxy.sexy',
		'chusovoj.luxy.sexy',
		'nytva.luxy.sexy',
		'sovetsk.luxy.sexy',
		'tajga.luxy.sexy',
		'zuevka.luxy.sexy',
		'krasnoarmejsk.luxy.sexy',
		'saraktash.luxy.sexy',
		'lyubercy.luxy.sexy',
		'buturlinovka.luxy.sexy',
		'suvorov.luxy.sexy',
		'severobajkalsk.luxy.sexy',
		'pavlovskij-posad.luxy.sexy',
		'ruza.luxy.sexy',
		'chernogorsk.luxy.sexy',
		'glarus.luxy.sexy',
		'anda.luxy.sexy',
		'chajkovskij.luxy.sexy',
		'dudinka.luxy.sexy',
		'sergach.luxy.sexy',
		'shebekino.luxy.sexy',
		'sosnovyj-bor.luxy.sexy',
		'zimovniki.luxy.sexy',
		'mozhajsk.luxy.sexy',
		'gubaha.luxy.sexy',
		'kushva.luxy.sexy',
		'zlatoust.luxy.sexy',
		'novoaleksandrovsk.luxy.sexy',
		'svetlyj.luxy.sexy',
		'polevskoj.luxy.sexy',
		'anzhero-sudzhensk.luxy.sexy',
		'vyazma.luxy.sexy',
		'mytishi.luxy.sexy',
		'krasnouralsk.luxy.sexy',
		'maloyaroslavec.luxy.sexy',
		'uchaly.luxy.sexy',
		'volzhskij.luxy.sexy',
		'shimanovsk.luxy.sexy',
		'lesnoj.luxy.sexy',
		'krasnovishersk.luxy.sexy',
		'tajshet.luxy.sexy',
		'tujmazy.luxy.sexy',
		'sibaj.luxy.sexy',
		'birsk.luxy.sexy',
		'kalach-na-donu.luxy.sexy',
		'novodvinsk.luxy.sexy',
		'kovrov.luxy.sexy',
		'konstantinovsk.luxy.sexy',
		'valujki.luxy.sexy',
		'valdaj.luxy.sexy',
		'kondopoga.luxy.sexy',
		'ilovlya.luxy.sexy',
		'yanaul.luxy.sexy',
		'kirovsk.luxy.sexy',
		'ufa.luxy.sexy',
		'unecha.luxy.sexy',
		'olenegorsk.luxy.sexy',
		'yahroma.luxy.sexy',
		'nevyansk.luxy.sexy',
		'bor.luxy.sexy',
		'shadrinsk.luxy.sexy',
		'staryj-oskol.luxy.sexy',
		'goryachij-klyuch.luxy.sexy',
		'zhirnovsk.luxy.sexy',
		'dzhubga.luxy.sexy',
		'velikij-novgorod.luxy.sexy',
		'staraya-russa.luxy.sexy',
		'kimry.luxy.sexy',
		'karabash.luxy.sexy',
		'leninogorsk.luxy.sexy',
		'petropavlovsk-kamchatskij.luxy.sexy',
		'emanzhelinsk.luxy.sexy',
		'shumerlya.luxy.sexy',
		'civilsk.luxy.sexy',
		'labytnangi.luxy.sexy',
		'golicyno.luxy.sexy',
		'otradnoe.luxy.sexy',
		'mariinskij-posad.luxy.sexy',
		'krasnoufimsk.luxy.sexy',
		'konakovo.luxy.sexy',
		'novocheboksarsk.luxy.sexy',
		'borovsk.luxy.sexy',
		'orehovo-zuevo.luxy.sexy',
		'ruzaevka.luxy.sexy',
		'slyudyanka.luxy.sexy',
		'belorechensk.luxy.sexy',
		'oktyabrskij.luxy.sexy',
		'sovetskaya-gavan.luxy.sexy',
		'kirovgrad.luxy.sexy',
		'elektrougli.luxy.sexy',
		'nahabino.luxy.sexy',
		'essentuki.luxy.sexy',
		'vidnoe.luxy.sexy',
		'lesosibirsk.luxy.sexy',
		'zhukovo.luxy.sexy',
		'yuzhnouralsk.luxy.sexy',
		'kaspijsk.luxy.sexy',
		'pechory.luxy.sexy',
		'petrov-val.luxy.sexy',
		'elabuga.luxy.sexy',
		'leninsk-kuzneckij.luxy.sexy',
		'kamensk-uralskij.luxy.sexy',
		'baltijsk.luxy.sexy',
		'uraj.luxy.sexy',
		'sestroreck.luxy.sexy',
		'shelehov.luxy.sexy',
		'novotroick.luxy.sexy',
		'yarcevo.luxy.sexy',
		'armavir.luxy.sexy',
		'troick.luxy.sexy',
		'volosovo.luxy.sexy',
		'udomlya.luxy.sexy',
		'pereslavl-zalesskij.luxy.sexy',
		'krasnokamensk.luxy.sexy',
		'ejsk.luxy.sexy',
		'kurganinsk.luxy.sexy',
		'prokopevsk.luxy.sexy',
		'koryazhma.luxy.sexy',
		'bodajbo.luxy.sexy',
		'naberezhnye-chelny.luxy.sexy',
		'neryungri.luxy.sexy',
		'morozovsk.luxy.sexy',
		'kuri.luxy.sexy',
		'kovdor.luxy.sexy',
		'sosnovka.luxy.sexy',
		'korkino.luxy.sexy',
		'berezovskij.luxy.sexy',
		'pionerskij.luxy.sexy',
		'pervouralsk.luxy.sexy',
		'desnogorsk.luxy.sexy',
		'shahunya.luxy.sexy',
		'kanash.luxy.sexy',
		'arsenev.luxy.sexy',
		'inta.luxy.sexy',
		'doneck.luxy.sexy',
		'borovichi.luxy.sexy',
		'pospelova.luxy.sexy',
		'novokujbyshevsk.luxy.sexy',
		'krymsk.luxy.sexy',
		'iskitim.luxy.sexy',
		'chebarkul.luxy.sexy',
		'dalmatovo.luxy.sexy',
		'torzhok.luxy.sexy',
		'spassk-dalnij.luxy.sexy',
		'sharypovo.luxy.sexy',
		'safonovo.luxy.sexy',
		'frolovo.luxy.sexy',
		'mikun.luxy.sexy',
		'yadrin.luxy.sexy',
		'losino-petrovskij.luxy.sexy',
		'luhovicy.luxy.sexy',
		'mineralnye-vody.luxy.sexy',
		'abinsk.luxy.sexy',
		'yurga.luxy.sexy',
		'shekino.luxy.sexy',
		'chekalin.luxy.sexy',
		'gryazovec.luxy.sexy',
		'vilyuchinsk.luxy.sexy',
		'mamonovo.luxy.sexy',
		'kiselevsk.luxy.sexy',
		'dubovka.luxy.sexy',
		'aleksin.luxy.sexy',
		'novyj-urengoj.luxy.sexy',
		'joensuu.luxy.sexy',
		'nizhnie-sergi.luxy.sexy',
		'novaya-ladoga.luxy.sexy',
		'temryuk.luxy.sexy',
		'celina.luxy.sexy',
		'sobinka.luxy.sexy',
		'neftekumsk.luxy.sexy',
		'osa.luxy.sexy',
		'lensk.luxy.sexy',
		'korolev.luxy.sexy',
		'zarajsk.luxy.sexy',
		'svobodnyj.luxy.sexy',
		'trehgornyj.luxy.sexy',
		'semenov.luxy.sexy',
		'topki.luxy.sexy',
		'ilanskij.luxy.sexy',
		'mariinsk.luxy.sexy',
		'pokrov.luxy.sexy',
		'kinel-cherkassy.luxy.sexy',
		'kulebaki.luxy.sexy',
		'strunino.luxy.sexy',
		'izberbash.luxy.sexy',
		'svetlogorsk.luxy.sexy',
		'tihoreck.luxy.sexy',
		'tarusa.luxy.sexy',
		'chernyahovsk.luxy.sexy',
		'naryan-mar.luxy.sexy',
		'pallasovka.luxy.sexy',
		'agidel.luxy.sexy',
		'krasnoznamensk.luxy.sexy',
		'gryazi.luxy.sexy',
		'sharya.luxy.sexy',
		'shilka.luxy.sexy',
		'poronajsk.luxy.sexy',
		'elizovo.luxy.sexy',
		'medvezhegorsk.luxy.sexy',
		'novoanninskij.luxy.sexy',
		'gavrilov-yam.luxy.sexy',
		'kaltan.luxy.sexy',
		'svetogorsk.luxy.sexy',
		'myshkin.luxy.sexy',
		'gudermes.luxy.sexy',
		'horol.luxy.sexy',
		'enisejsk.luxy.sexy',
		'krasnyj-sulin.luxy.sexy',
		'gulkevichi.luxy.sexy',
		'bolgar.luxy.sexy',
		'gusinoozersk.luxy.sexy',
		'rostov-na-donu.luxy.sexy',
		'yasnyj.luxy.sexy',
		'zelenokumsk.luxy.sexy',
		'kozlovka.luxy.sexy',
		'zaporozhe.luxy.sexy',
		'shumiha.luxy.sexy',
		'litvinov.luxy.sexy',
		'primorsko-ahtarsk.luxy.sexy',
		'kalach.luxy.sexy',
		'usole-sibirskoe.luxy.sexy',
		'velikij-ustyug.luxy.sexy',
		'artemovskij.luxy.sexy',
		'lipki.luxy.sexy',
		'uryupinsk.luxy.sexy',
		'hasavyurt.luxy.sexy',
		'danilovka.luxy.sexy',
		'balahna.luxy.sexy',
		'bujnaksk.luxy.sexy',
		'dankov.luxy.sexy',
		'sergiev-posad.luxy.sexy',
		'tashtagol.luxy.sexy',
		'nerehta.luxy.sexy',
		'kotelnikovo.luxy.sexy',
		'samara.luxy.sexy',
		'zapolyarnyj.luxy.sexy',
		'velsk.luxy.sexy',
		'lermontov.luxy.sexy',
		'selco.luxy.sexy',
		'ajhal.luxy.sexy',
		'kamen-na-obi.luxy.sexy',
		'marki.luxy.sexy',
		'belomorsk.luxy.sexy',
		'mihajlovka.luxy.sexy',
		'suhoj-log.luxy.sexy',
		'kamen-rybolov.luxy.sexy',
		'mogocha.luxy.sexy',
		'belokuriha.luxy.sexy',
		'slavyansk.luxy.sexy',
		'zheleznogorsk-ilimskij.luxy.sexy',
		'pervomajsk.luxy.sexy',
		'verhnij-ufalej.luxy.sexy',
		'shelkovo.luxy.sexy',
		'bobrov.luxy.sexy',
		'vyshnij-volochek.luxy.sexy',
		'sherbinka.luxy.sexy',
		'kasimov.luxy.sexy',
		'aleksandrovsk.luxy.sexy',
		'hilok.luxy.sexy',
		'rodionovo-nesvetajskaya.luxy.sexy',
		'shlisselburg.luxy.sexy',
		'vasilkov.luxy.sexy',
		'pyt-yah.luxy.sexy',
		'kemer.luxy.sexy',
		'kalyazin.luxy.sexy',
		'izobilnyj.luxy.sexy',
		'mendeleevsk.luxy.sexy',
		'alapaevsk.luxy.sexy',
		'efremov.luxy.sexy',
		'neman.luxy.sexy',
		'toki.luxy.sexy',
		'nizhnij-novgorod.luxy.sexy',
		'ozersk.luxy.sexy',
		'jeleznogorsk.luxy.sexy',
		'gus-hrustalnyj.luxy.sexy',
		'kamensk-shahtinskij.luxy.sexy',
		'aksaj.luxy.sexy',
		'gaj.luxy.sexy',
		'mirnyj.luxy.sexy',
		'pitkyaranta.luxy.sexy',
		'aleksandrovsk-sahalinskij.luxy.sexy',
		'lyskovo.luxy.sexy',
		'cimlyansk.luxy.sexy',
		'babaevo.luxy.sexy',
		'orlov.luxy.sexy',
		'kalinovka.luxy.sexy',
		'novi.luxy.sexy',
		'uvelskij.luxy.sexy',
		'fokino.luxy.sexy',
		'rudnya.luxy.sexy',
		'petrovskoe.luxy.sexy',
		'karaman.luxy.sexy',
		'ryazhsk.luxy.sexy',
		'blagodarnyj.luxy.sexy',
		'nizhnyaya-tura.luxy.sexy',
		'fastov.luxy.sexy',
		'vyatskie-polyany.luxy.sexy',
		'kotelniki.luxy.sexy',
		'saraj.luxy.sexy',
		'segezha.luxy.sexy',
		'vesegonsk.luxy.sexy',
		'novyj-oskol.luxy.sexy',
		'nazran.luxy.sexy',
		'krasnoyarsk.luxy.sexy',
		'zheleznogorsk.luxy.sexy',
		'zelenogorsk.luxy.sexy'];

	this.linksYa = function(){
		var url = 'http://webmaster.yandex.ru/site/verification.xml?wizard=verification&wizard-hostid=&host=';

		var html = '<html><head><style type="text/css">a:visited{display:none;}</style></head><body>';

		links.forEach(function(link){
			html += '<a href="'+url+link+'" target="_blank">'+link+'</a><br/>';
		});

		this.echo(html + '</body></html>');
	}

	this.linksGo = function(){
		var url = 'https://www.google.com/webmasters/verification/verification?hl=ru&siteUrl=http://';

		var html = '';

		links.forEach(function(link){
			html += '<a href="'+url+link+'" target="_blank">'+link+'</a><br/>';
		});

		this.echo(html);
	}

	this.yandexApi = function(){
		const POST = 'POST',
			GET = 'GET';



		this.yaApiQuery('',GET,{},function(result){
			var hostList = result.service.workspace[0].collection[0].link[0].$.href.replace('https://webmaster.yandex.ru/api/v2/','');
			that.yaApiQuery(hostList,GET,{},function(result){
				that.json(result);
			});
		});
	}


	this.yaApiQuery = function(query, method, body, next){

		method = method.toUpperCase();

		var http = require('https'),
			token = 'cd2ae3aefc344f9194be8264d3fb4f03',
			querystring = require('querystring'),
			postData = querystring.stringify(body),
			parseString = require('xml2js').parseString,
			options = {
				host: 'webmaster.yandex.ru',
				path: '/api/v2/' + query,
				method: method,
				headers: {
					'Authorization': 'OAuth ' + token,
					'Content-Length': postData.length
				}
			};

		var req = http.request(options,function(res){
			var result = '';

			res.on('data',function(chunk){
				result = result + chunk;
			});

			res.on('end',function(){
				parseString(result,function(err,result){
					next(result);
				})
			});
		});

		if(method == 'POST'){
			req.write(postData);
		}
		req.end();



	}
}


module.exports = Controller;