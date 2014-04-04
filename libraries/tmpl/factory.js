var Factory = function(params){

    var factory = this;

    this.init = function(params){
        if(typeof params != "undefined"){
            params.defaults(this.default_params());
        }else{
            params = this.default_params();
        }
        this._params = params;
    }

    this.head = function(){

        var head = factory.compile(factory.template('head'),factory._params);

        return head;
    }



    this.default_params = function(){
        var defaults = {
            js:[
                'http://code.jquery.com/jquery-2.1.0.min.js'
            ],
            css:[
                '/admin/media/css/bootstrap.css'
            ]
        };

        return defaults;
    }


    this.init(params);

    return this;
}

module.exports = Factory;