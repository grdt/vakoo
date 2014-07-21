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
            return _.clone(this);
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
    }
});

/** @global */
var translit = function(text){
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

global.translit = translit;
