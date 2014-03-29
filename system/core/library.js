var Library = function(lib_name){
    var library = this;

    this.LIBRARY_NAME = lib_name;

    this.LIBRARY_PATH = this.LIBRARIES_PATH + this.SEPARATOR + this.LIBRARY_NAME;

    this.library = require(this.LIBRARIES_PATH + this.SEPARATOR + this.LIBRARY_NAME + this.SEPARATOR +'index' + this.EXT_JS);

    this.library.prototype = this;

    return this.library;

}

module.exports = Library;