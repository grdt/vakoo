MongoClient = require("mongodb").MongoClient

class Mongo extends Vakoo.Storage.Extender

  constructor: (@config)->


  connect: (callback)=>
    @url  = "mongodb://localhost:27017/#{@config.database}"

    MongoClient.connect @url, (err, db)=>
      unless err
        @client = db
        Vakoo.logger.info "Mongodb. Connected to `#{@config.database}` successful."
      callback err



module.exports = Mongo