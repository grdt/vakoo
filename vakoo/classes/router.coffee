Susanin = require "susanin"
_ = require "underscore"

class Router

  constructor: (@config, callback)->
    @susanin = Susanin()
    @logger = Vakoo.loggers.Router
    @routes = []

    @defaults = null

    for pattern, data of @config
      if pattern is "default"
        @susanin.addRoute(
          pattern: "/"
          defaults: data
        )

        @defaults = data

      else
        @susanin.addRoute(
          pattern: "/#{pattern}"
          defaults: _.defaults data, @defaults
        )

    @logger.info "Enable successfully."

    callback()

  fetch: (url)=>
    return @susanin.findFirst url

module.exports = Router