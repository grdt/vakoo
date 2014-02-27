var User = function(){

    this.collectionName = 'users';

    this._id = false;

    this.name = '';

    this.email = '';

    this.password = '';

    this.status = '';

    return this;
}


module.exports = User;