smtp = require "simplesmtp"
MailComposer = require("mailcomposer").MailComposer

class Mailer

  constructor: (@config, callback)->
    @logger = Vakoo.loggers.Mailer
    @client = smtp.createClientPool(
      @config.outgoing.port
      @config.outgoing.host
      @config.outgoing.options
    )

    @logger.info "Enable successfully."
    callback()

  sendMail: (recepient, subject, body, callback)=>
    @client.sendMail(
      @compose(recepient, subject, body)
      (err, result)=>
        if err
          @logger.error err
        else
          @logger.info "Send message to `#{recepient}` with subject `#{subject}` successfully."
        callback err, result
    )

  compose: (recepient, subject, html)->

    mailComposer = new MailComposer

    mailComposer.setMessageOption({
      from: @config.from
      to: recepient
      html: html
      subject: subject
    });

    return mailComposer

module.exports = Mailer