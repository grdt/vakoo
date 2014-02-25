var router = function(app){

    if(typeof app == "undefined"){
        throw new Error("App in undefined");
    }

    var _this = this;
    
    this._app = app;

    this.option = false; //default component

    this.controller = 'main'; //default controller

    this.method = 'index'; //default method

    this.request = {};

    this.response = {};

    this.execute = function(req,res){
        var url = _this.fetchUrl(req,res);
        var controller = _this._app.load.controller(_this.option,_this.controller);
        controller.run(_this.method);
    }

    this.fetchUrl = function(req,res){
        _this.request = req;
        _this.response = res;
        _this.controller = 'main';
        _this.method = 'index';
        _this.option = false;
        return true;
    }


    return this;
}

module.exports = router;