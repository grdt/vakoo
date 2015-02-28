MongoClient = require("mongodb").MongoClient
ObjectID = require("mongodb").ObjectID

class Mongo extends Vakoo.Storage.Extender

  constructor: (@config)->
    @logger = Vakoo.loggers.Mongo

    @ObjectID = ObjectID

  connect: (callback)=>
    @url  = "mongodb://localhost:27017/#{@config.database}"

    MongoClient.connect @url, (err, db)=>
      if err
        @logger.error err.toString()
      else
        @client = db
        @logger.info "Connected to `#{@config.database}` successfully."
      callback err

  collection: (name)=>
    return @client.collection name



module.exports = Mongo