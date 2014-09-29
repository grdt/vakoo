console.log('\n\n');

var vakoo = require('./system/index')(),
	/**
	 * @type {ShopUpdateController} updater
	 */
	updater = vakoo.load.option('shop').controller('update');


vakoo.load.db._driver.emitter.on('db_conn',function(){
	updater.parse();
});