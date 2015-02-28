session = require "express-session"
MongoStore = (require "connect-mongo") session

class MongoSessionInitializer

  constructor: (callback)->
    Vakoo.loggers.Initialize.info "Start `mongo-session`."
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
    Vakoo.loggers.Initialize.info "Complete `mongo-session` successfully."
    callback()


module.exports = MongoSessionInitializer