$(document).ready(function(){
	dateFormating();
});


var dateFormating = function(){
	moment.lang('ru');
	const JUST_NOW_TIMEOUT = 5 * 60 * 1000;
	$(".date").each(function(){
		var date = new Date($(this).html());

		switch($(this).data('moment')){
			case 'calendar':
				$(this).html(moment(date).calendar());
				break;
			case "no":
				break;
			case "format":
				$(this).html(moment(date).format($(this).data('format')));
				break;
			case 'fromnow':
				if(((new Date).getTime() - date.getTime()) <= JUST_NOW_TIMEOUT){
					$(this).html('только что');
				}else{
					$(this).html(moment(date).fromNow());
				}
				break;
			default:
				if(moment(date).format('L') == moment().format('L')){
					//today
					$(this).html('сегодня в ' + moment(date).format('HH:mm'));
				}else{
					$(this).html(moment(date).format('LLLL'));
				}
				break;
		}
	});
}

var numberFormat = function(number, decimals, dec_point, thousands_sep){
	var i, j, kw, kd, km;
	if( isNaN(decimals = Math.abs(decimals)) ){
		decimals = 0;
	}
	if( dec_point == undefined ){
		dec_point = ".";
	}
	if( thousands_sep == undefined ){
		thousands_sep = " ";
	}

	i = parseInt(number = (+number || 0).toFixed(decimals)) + "";

	if( (j = i.length) > 3 ){
		j = j % 3;
	} else{
		j = 0;
	}

	km = (j ? i.substr(0, j) + thousands_sep : "");
	kw = i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands_sep);
	//kd = (decimals ? dec_point + Math.abs(number - i).toFixed(decimals).slice(2) : "");
	kd = (decimals ? dec_point + Math.abs(number - i).toFixed(decimals).replace(/-/, 0).slice(2) : "");

	return km + kw + kd;
}


var Storage = function (namespace) {

	this._namespace = '';

	if (typeof namespace != "undefined" && namespace) {
		this._namespace = namespace;
	}

	this.set = function (key, value) {
		if (this.enabled) {
			if(value === null) {
				localStorage.removeItem(this.key(key));
			} else {
				localStorage.setItem(this.key(key), value);
			}
		} else {
			console.log('local storage not enabled');
		}
	}

	this.get = function (key) {
		if (this.enabled) {
			return localStorage.getItem(this.key(key));
		} else {
			console.log('local storage not enabled');
		}
	}

	this.remove = function (key) {
		localStorage.removeItem(this.key(key));
	}

	this.key = function (key) {
		return (this._namespace) ? this._namespace + ':' + key : key;
	}

	this.isLocalStorageAvailable = function () {
		try {
			return 'localStorage' in window && window['localStorage'] !== null;
		} catch (e) {
			return false;
		}
	}

	this.enabled = this.isLocalStorageAvailable();

};

var Page = new (function(){


	this.getHost = function(domain){
		if(typeof domain != "undefined" && domain == true){
			var host = window.location.hostname,
				splitted = host.split('.');

			var result = splitted.splice(splitted.length - 2,splitted.length).join('.');
			return result;
		}
		return window.location.hostname;
	}

	this.getSubdomain = function(){
		var host = window.location.hostname,
			splitted = host.split('.');

		if(splitted.length == 2){
			return false;
		}else if(splitted.length == 3){
			return splitted[0];
		}else{
			return splitted.splice(0,splitted.length - 2).join('.');
		}
	}


    if ($.cookie){
        $.cookie.defaults = {
            domain: '.' + this.getHost(true),
            expires:365,
            path:'/'
        };

        this.cookie = function(variable, value){
            if(typeof value == "undefined"){
                return $.cookie(variable);
            }

            if(value === null){
                $.removeCookie(variable);
                return this;
            }

            $.cookie(variable, value);
            return this;
        }
    }
})();