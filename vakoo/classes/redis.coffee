redis = require "redis"

class Redis extends Vakoo.Storage.Extender
  constructor: (@config)->
    @logger = Vakoo.loggers.Redis


  connect: (callback)=>
    @client = redis.createClient()

    errorCalled = false

    @client.on "error", (e)=>
      unless errorCalled
        errorCalled = true
        @logger.error e.toString()
        callback e

    @client.on "connect", =>
      @logger.info "Connected to `127.0.0.1` successfully."
      callback()


module.exports = Redis