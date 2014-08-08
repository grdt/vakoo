var MailModel = function(){
	var that = this;

	this.COLLECTION_NAME = 'mail_log';

	this._id = '';

	this.recepient = '';

	this.subject = '';

	this.body = '';

	this.created = new Date();

	this.status = 'new';

	this.message = false;

	this.compose = function(){
		var MailComposer = require("mailcomposer").MailComposer,
			mailcomposer = new MailComposer();

		mailcomposer.setMessageOption({
			from: "Менеджер LUXYsexy <shop@luxy.sexy>",
			to: this.recepient,
			html: this.body,
			subject: this.subject
		});

		return mailcomposer;
	}

}

module.exports = MailModel;