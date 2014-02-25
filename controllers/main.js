var main = function(){

    this.index = function(){
        this.load.helper('date');
        this.send({aza:this.h.date.aza('olo')});
    }

    return this;
}

module.exports = main;