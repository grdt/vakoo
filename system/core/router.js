var fs = require('fs');
var router = function(app){

    if(typeof app == "undefined"){
        throw new Error("App in undefined");
    }

    var _this = this;
    
    this._app = app;

    this.option = 'main'; //default component

    this.controller = 'controller'; //default controller

    this.method = 'index'; //default method

    this.request = {};

    this.response = {};

    this.execute = function(req,res,nofetch){
        var url = _this.fetchUrl(req,res);
        var controller = _this._app.load.controller(_this.option,_this.controller);
        controller.run(_this.method);
    }

    this.fetchUrl = function(req,res){
        
        _this.request = req;
        _this.response = res;

        if(req.url == '/'){
            _this.controller = 'controller';
            _this.method = 'index';
            _this.option = 'main';
        }else{
            if(typeof req.param('task') != "undefined"){
                var task = req.param('task').split('.');
                _this.method = task[task.length - 1];
                if(task.length == 2){
                    _this.controller = task[0];
                }
            }

            if(typeof req.param('option') != "undefined"){
                _this.option = req.param('option');
            }

            if(this.defaultRoutes()){
                this.show404();
            }

        }
        return req.url;
    }

    this.defaultRoutes = function(){
        return (this.controller == 'controller' && this.method == 'index' && this.option == 'main');
    }

    this.show404 = function(mess){
        if(typeof mess == "undefined"){
            mess = 'page not found';
        }
        this.response.statusCode = 404;
        this.response.send({success:false,message:mess});
    }

    this.init = function(){
        var routes_path = this._app.APP_PATH + '/routes';
        if(fs.existsSync(routes_path + '.js')){
            var routes = require(routes_path);
            for(key in routes){
                _this._app._express.all('/'+key,function(req,res){
                    console.log(key);
                    if(typeof routes[key].option != "undefined"){
                        _this.option = routes[key].option;
                        _this.controller = (typeof routes[key].controller != "undefined") ? routes[key].controller : 'controller';
                        _this.method = (typeof routes[key].method != "undefined") ? routes[key].method : 'index';
                        _this.request = req;
                        _this.response = res;
                        for(i in routes[key]){
                            if(routes[key][i][0] == ':'){
                                if(i == 'method' || i == 'option' || i == 'controller'){
                                    _this[i] = req.param(i);
                                }
                            }
                        }
                        _this.execute(req,res);
                    }else{
                        throw new Error('this must be 404. illegal route params');
                    }
                });
            }
        }
    }


    return this;
}

module.exports = router;