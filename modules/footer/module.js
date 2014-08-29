var Footer = function(){

	this.render = function($f,data,options){
		data = data || {};
		var footer = data.footer || {};
		return {view:'modules.footer',data:footer};
	}
}

module.exports = Footer;