var Tmpl = function(){


    this.render = function(view,data){
        console.log(this.LIBRARY_NAME);
        console.log(this.LIBRARY_PATH);
        console.log('render view: ',view,'with data: ',data);
    }

    return this;

}

module.exports = Tmpl;