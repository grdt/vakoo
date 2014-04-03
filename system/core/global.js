var _ = require('underscore');
var fs = require('fs');

global._ = _;
global.fs = fs;

Object.defineProperties(Object.prototype,{
    defaults:{
        writable: false,
        configurable: false,
        value: function(example){
            if(typeof example == "undefined"){
                example = {};
            }
            _.defaults(this,example);
            return this;
        }
    },
    isEmpty:{
        writable: false,
        configurable: false,
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
        writable: false,
        configurable: false,
        value: function(){
            return _.clone(this);
        }
    },
    pick:{
        writable: false,
        configurable: false,
        value: function(pick){
            return _.pick(this,pick);
        }
    },
    keys:{
        writable: false,
        configurable: false,
        value: function(){
            return _.keys(this);
        }
    },
    without:{
        writable: false,
        configurable: false,
        value: function(without){
            var obj = _.without(this,without);
            return obj;

            //todo return this;

        }
    },
    functions:{
        writable: false,
        configurable: false,
        value: function(){
            return _.functions(this);
        }
    },
    withoutFunctions:{
        writable:false,
        configurable:false,
        value:function(){
            var funcs = this.functions();
            for(func in funcs){
                this.without(funcs[func]);
            }
            return this;
        }
    }
});