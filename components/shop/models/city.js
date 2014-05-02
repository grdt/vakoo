var City = function(){

	this.COLLECTION_NAME = 'cities';

	this._id = '';


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

	this.byIP = function(ip){
		if(!_.isNumber(ip)){
			ip = this.ip2long(ip);
		}

		this.where({block:{$elemMatch:{begin_ip:{$lte:ip},end_ip:{$gte:ip}}}});
		return this;
	}

	this.byCoords = function(loc){
		loc.lng = parseFloat(loc.lng);
		loc.lat = parseFloat(loc.lat);
		this.where({loc:{$near:[loc.lng,loc.lat]}});
		return this;
	}


	this.ip2long = function(IP) {
		var i = 0;

		IP = IP.match(
			/^([1-9]\d*|0[0-7]*|0x[\da-f]+)(?:\.([1-9]\d*|0[0-7]*|0x[\da-f]+))?(?:\.([1-9]\d*|0[0-7]*|0x[\da-f]+))?(?:\.([1-9]\d*|0[0-7]*|0x[\da-f]+))?$/i
		);
		if (!IP) {
			return false;
		}
		IP[0] = 0;
		for (i = 1; i < 5; i += 1) {
			IP[0] += !! ((IP[i] || '')
				.length);
			IP[i] = parseInt(IP[i]) || 0;
		}
		IP.push(256, 256, 256, 256);
		IP[4 + IP[0]] *= Math.pow(256, 4 - IP[0]);
		if (IP[1] >= IP[5] || IP[2] >= IP[6] || IP[3] >= IP[7] || IP[4] >= IP[8]) {
			return false;
		}
		return IP[1] * (IP[0] === 1 || 16777216) + IP[2] * (IP[0] <= 2 || 65536) + IP[3] * (IP[0] <= 3 || 256) + IP[4] * 1;
	}

	return this;
}

module.exports = City;