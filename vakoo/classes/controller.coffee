_ = require "underscore"

class Controller

  constructor: (@context, @logger)->

  where: =>
    @context.send(
      method: @context.request.method
      url: @context.request.path
      query: @context.request.query
      controller: @context.route.controller
      action: @context.route.action
    )

  get: (name, defaults)=>
    unless name
      return @context.request.query
    if @context.request.query[name]?
      if @context.request.query[name]
        result = if _.isNaN(+@context.request.query[name]) then @context.request.query[name] else +@context.request.query[name]
        return result or defaults
      else return defaults
    else
      return defaults

  post: (name, defaults)=>
    unless @context.request.method.toLowerCase() is "post"
      return false
    unless name
      return @context.request.body
    if @context.request.body[name]?
      if @context.request.body[name]
        result = if _.isNaN(+@context.request.body[name]) then @context.request.body[name] else +@context.request.body[name]
        return result or defaults
      else return defaults
    else
      return defaults

  error: (data)=>
    @context.response.code = 404
    @context.send data

  echo: (data)=>
    @context.send data

module.exports = Controller