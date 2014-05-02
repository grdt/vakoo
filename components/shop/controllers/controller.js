var Controller = function(){

	var $c = this;

	this.index = function(){
		this.model('category').find(function(categories){
			$c.tmpl().display('main',{
				"catalog:menu":{
					categories:categories
				}
			});
		});
	}

}


module.exports = Controller;