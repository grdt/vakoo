/**
 * @extends CoreModel
 * @constructor
 */
var Feedback = function(){

	this.COLLECTION_NAME = 'feedback';

	this._id = '';
	this.contact = '';
	this.name = '';
	this.message = '';
}

module.exports = Feedback;