_ = require "underscore"

class Context

  constructor: (@requester, @responser, route)->

    @route = route[1]

    @request =
      method: @requester.method
      path: @requester.path
      query: _.defaults @requester.query, @route
      body: @requester.body
      ip: @requester.ip
      userAgent: @requester.headers['user-agent']
      headers: @requester.headers
      options: {}
      url: @requester.url

    @response =
      code: 200
      headers: null
      data: null

  send: (data, headers)->
    if _.isObject(data)
      @responser.setHeader 'Content-Type', 'application/json; charset=utf-8'
    else
      @responser.setHeader 'Content-Type', 'text/html; charset=utf-8'
      data = "" + data
    if headers?
      @responser.setHeader h, v for h, v of headers
    @responser.status(@response.code).send(data)

  sendError: (data)=>
    if @response.code is 200
      @response.code = 404
    @send data

  sendHandler: (err, data, turn = true)=>
    if err
      @sendError if turn then {error: err} else err
    else
      @send data

module.exports = Context