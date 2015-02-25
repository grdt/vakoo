redis = require "redis"

class Redis extends Vakoo.Storage.Extender
  constructor: (@config)->

  connect: (callback)=>
    @client = redis.createClient()
    @client.on "error", callback

    @client.on "connect", ->
      Vakoo.logger.info "Redis. Connected to `127.0.0.1` successful."
      callback()


module.exports = Redis