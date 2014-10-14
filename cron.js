console.log('\n\n');

var vakoo = require('./system/index')(),
	/**
	 * @type {ShopUpdateController} updater
	 */
	updater = vakoo.load.option('shop').controller('update');

var program = require('commander'),
	cron = require('cron');

vakoo.load.db._driver.emitter.on('db_conn',function(){
//	updater.priceUpdate();
//	updater.updateImages(true);

	program
		.option('-i, --image', 'update image')
		.option('-a, --all', 'update ALL images')
		.option('-s, --size', 'update sizes')
		.option('-u, --update', 'update prices')
		.option('-o, --unowned', 'catch unowned products')
		.parse(process.argv);

	if(program.image){
		updater.updateImages(program.all, function(){
			console.log('all images updated');
			process.exit(0)
		});
	}

	if(program.size){
		updater.updateSizes(function(){
			console.log('all sizes updated');
			process.exit(0)
		});
	}

	if(program.update){
		updater.priceUpdate(function(){
			console.log('all prices updated');
			process.exit(0)
		});
	}

	if(program.unowned){
		updater.catchUnowned(function(){
			console.log('unowned complete');
			process.exit(0)
		})
	}
	
	if(!program.image && !program.size && !program.update && !program.unowded){
		var CronJob = require('cron').CronJob;
		var job = new CronJob('00 00 03 * * *', function(){
				updater.priceUpdate(function(){
					console.log("price update");
				});
			}, function () {
				
			},
			true,
			"Europe/Moscow"
		);

		var job2 = new CronJob('00 00 03 * * 1,3,5', function(){
				updater.updateSizes(function(){
					console.log("sizes update");
				});
			}, function () {

			},
			true,
			"Europe/Moscow"
		);
	}

});