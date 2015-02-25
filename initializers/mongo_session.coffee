session = require "express-session"
MongoStore = (require "connect-mongo") session

class MongoSessionInitializer

  constructor: (callback)->
    Vakoo.logger.info "Initializer. Start `mongo-session` initializer."
    Vakoo.web.app.use(
      session(
        store: new MongoStore url:Vakoo.Storage.mongo.url
        secret: "vakoosecretkey"
        key: "vakoo.sid"
        saveUninitialized: true
        resave: true
        cookie:
          maxAge: new Date(Date.now() + 25920000000)
#          domain: 'vakoo.ru'
      )
    )
    Vakoo.logger.info "Initializer. Initializer `mongo-session` complete successful."
    callback()


module.exports = MongoSessionInitializer