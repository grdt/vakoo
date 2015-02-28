async = require "async"

Vakoo = require "./vakoo"

async.waterfall(
  [
    async.apply Vakoo.addStorage, "mongo"
    async.apply Vakoo.addStorage, "redis"
    async.apply Vakoo.createServer
    async.apply Vakoo.initRouter
    async.apply Vakoo.initialize
    Vakoo.init
  ]
  (err)->
    if err
      Vakoo.logger.error "Vakoo init err: #{err}"
    else
      Vakoo.logger.info "Vakoo init successfully."
)