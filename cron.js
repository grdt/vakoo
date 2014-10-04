console.log('\n\n');

var vakoo = require('./system/index')(),
	/**
	 * @type {ShopUpdateController} updater
	 */
	updater = vakoo.load.option('shop').controller('update');

var program = require('commander');

vakoo.load.db._driver.emitter.on('db_conn',function(){
//	updater.priceUpdate();
//	updater.updateImages(true);

	program
		.option('-i, --image', 'update image')
		.option('-a, --all', 'update ALL images')
		.option('-s, --size', 'update sizes')
		.option('-u, --update', 'update prices')
		.parse(process.argv);

	if(program.image){
		updater.updateImages( program.all );
	}

	if(program.size){
		updater.updateSizes();
	}

	if(program.update){
		updater.priceUpdate();
	}

});