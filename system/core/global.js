var _ = require('underscore');
var fs = require('fs');

global._ = _;
global.fs = fs;

Object.defineProperties(Object.prototype,{
    defaults:{
        writable: true,
        configurable: true,
        value: function(example){
            if(typeof example == "undefined"){
                example = {};
            }
            _.defaults(this,example);
            return this;
        }
    },
	isArray:{
		writable: true,
		configurable: true,
		value: function(){
			return _.isArray(this);
		}
	},
    isEmpty:{
        writable: true,
        configurable: true,
        value: function(){
            return _.isEmpty(this);
        }
    },
    isEqual:{
        writable: false,
        configurable: false,
        value: function(example){
            if(typeof example == "undefined"){
                example = {};
            }
            return _.isEqual(this,example);
        }
    },
    clone:{
        writable: true,
        configurable: true,
        value: function(){
			var that = this,
				clone = _.clone(that);

			if(typeof that._keys != "undefined"){
				that._keys.forEach(function(key){
					if(typeof that.__lookupGetter__(key) == "function"){
						clone.__defineGetter__(key,that.__lookupGetter__(key));
					}

					if(typeof that.__lookupSetter__(key) == "function"){
						clone.__defineSetter__(key,that.__lookupSetter__(key));
					}
				});
			}

            return clone;
        }
    },
    pick:{
        writable: true,
        configurable: true,
        value: function(pick){
            return _.pick(this,pick);
        }
    },
    keys:{
        writable: true,
        configurable: true,
        value: function(){
            return _.keys(this);
        }
    },
    without:{
        writable: true,
        configurable: true,
        value: function(without){
            var obj = _.without(this,without);
            return obj;

            //todo return this;

        }
    },
    functions:{
        writable: true,
        configurable: true,
        value: function(){
            return _.functions(this);
        }
    },
    withoutFunctions:{
        writable:true,
        configurable:true,
        value:function(){
            var funcs = this.functions();
            for(func in funcs){
                this.without(funcs[func]);
            }
            return this;
        }
    },
	asyncEach:{
		writable: true,
		configurable: true,
		value: function(iterator, callback){
			var iterate = function () {
					pointer++;
					if (pointer >= this.length) {
						if(typeof callback == "function"){
							callback();
						}
						return;
					}
					iterator.call(iterator, this[pointer], iterate, pointer);
				}.bind(this),
				pointer = -1;
			iterate(this);
		}
	}
});

/** @global */
var translit= function(text){
	var space = '-';
	text = text.toLowerCase();
	var transl = {
		'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e', 'ж': 'zh',
		'з': 'z', 'и': 'i', 'й': 'j', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n',
		'о': 'o', 'п': 'p', 'р': 'r','с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h',
		'ц': 'c', 'ч': 'ch', 'ш': 'sh', 'щ': 'sh','ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
		' ': space, '_': space, '`': space, '~': space, '!': space, '@': space,
		'#': space, '$': space, '%': space, '^': space, '&': space, '*': space,
		'(': space, ')': space,'-': space, '\=': space, '+': space, '[': space,
		']': space, '\\': space, '|': space, '/': space,'.': space, ',': space,
		'{': space, '}': space, '\'': space, '"': space, ';': space, ':': space,
		'?': space, '<': space, '>': space, '№':space
	}

	var result = '';
	var curent_sim = '';

	for(i=0; i < text.length; i++) {
		// Если символ найден в массиве то меняем его
		if(transl[text[i]] != undefined) {
			if(curent_sim != transl[text[i]] || curent_sim != space){
				result += transl[text[i]];
				curent_sim = transl[text[i]];
			}
		}
		// Если нет, то оставляем так как есть
		else {
			result += text[i];
			curent_sim = text[i];
		}
	}

	result = result.replace(/^-/, '');
	result = result.replace(/-$/, '');
	return result;
}

var ucfirst = function(str){
	if(str.length) {
		str = str.charAt(0).toUpperCase() + str.slice(1);
	}
	return str;
}

global.translit = translit;
global.ucfirst = ucfirst;
