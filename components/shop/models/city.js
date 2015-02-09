/**
 * @returns {CityModel}
 * @extends CoreModel
 * @constructor
 */
var City = function(){

	this.COLLECTION_NAME = 'cities';

	this._id = '';

	this.alias = '';
	this.cid = 0;
	this.block = [];
	this.name_ru = '';
	this.title_in = '';
	this.title_from = '';
	this.name_en = '';
	this.region = 0;
	this.latitude = 0;
	this.longitude = 0;
	this.loc = {
		lng:0,
		lat:0
	}
	this.data = {};

	this.status = 'active';

	this.short = function(){
		var object = {
			alias:this.alias,
			title:this.name_ru,
			titles:{
				"in":this.title_in,
				from:this.title_from
			},
//			code:this.data.postal_code,
//			region: (this.data.region_type == 'г') ? '' : this.data.region + ' ' + (this.data.region_type_full || '')
			region: this.region
		};
		return object;
	}

	this.byIP = function(ip){
		if(!_.isNumber(ip)){
			ip = this.ip2long(ip);
		}

		this.where({block:{$elemMatch:{begin_ip:{$lte:ip},begin_end:{$gte:ip}}},status:'active'});
		return this;
	}

	this.byCoords = function(loc){
		loc.lng = parseFloat(loc.lng);
		loc.lat = parseFloat(loc.lat);
		this.where({loc:{$near:[loc.lng,loc.lat],$maxDistance: 5},status:'active'});
		return this;
	}


	this.ip2long = function(IP) {
        var ipA = IP.split(".");
        var block = ((parseInt(ipA[0]) * 256 * 256 * 256) + (parseInt(ipA[1]) * 256 * 256) + (parseInt(ipA[2]) * 256) + parseInt(ipA[3]));
        return block;
	}

	return this;
}

module.exports = City;