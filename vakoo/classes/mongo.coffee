MongoClient = require("mongodb").MongoClient

class Mongo extends Vakoo.Storage.Extender

  constructor: (@config)->
    @logger = Vakoo.loggers.Mongo

  connect: (callback)=>
    @url  = "mongodb://localhost:27017/#{@config.database}"

    MongoClient.connect @url, (err, db)=>
      if err
        @logger.error err.toString()
      else
        @client = db
        @logger.info "Connected to `#{@config.database}` successfully."
      callback err



module.exports = Mongo