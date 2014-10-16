var Ym = function(){
  var that = this;

  this.index = function(){
    this.model("category").find(function(categories){
      var mass = [];
      categories.forEach(function(category){
        mass.push(category.clean());
      });
      that.json(mass);
    });
  }
};

module.exports = Ym;