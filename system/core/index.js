var core = function(app){

    if(typeof app == "undefined"){
        throw new Error("App in undefined");
    }

    var _this = this;

    this._app = app;

    this.router = function(){
        var router = require('./router');
        return new router(_this._app);
    }

    this.controller = function(){
        var controller = require('./controller');
        return new controller(_this._app);
    }

    this.loader = function(){
        var loader = require('./loader');
        return new loader(_this._app);
    }

    return this;
};

module.exports = core;