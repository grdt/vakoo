var User = function(){

    this.COLLECTION_NAME = 'users';

    this._id = '';

    this.email = '';

    this.password = '';

    this.status = 'active';

    this.register = new Date();

    this.last_login = new Date();

    return this;
}

module.exports = User;