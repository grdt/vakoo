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