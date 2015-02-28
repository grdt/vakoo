express = require "express"
multipart = require "connect-multiparty"
bodyParser = require "body-parser"
cookieParser = require "cookie-parser"
errorhandler = require "errorhandler"
http = require "http"

session = require "express-session"
MongoStore = (require "connect-mongo") session

class Web

  constructor: (@config)->

    @logger = Vakoo.loggers.Web

    @port = @config.port ? 8773

    @app = express()

    @app.use bodyParser.json()
    @app.use bodyParser.urlencoded extended: true
    @app.use cookieParser()
    @app.use multipart uploadDir: APP_PATH + "/tmp"
    @app.use express.static APP_PATH + "/public"
    @app.use errorhandler()

  start: (callback)=>

    @app.all "*", @execute

    @server = @app.listen(
      @port
      =>
        @logger.info "Start listening port `#{@port}`"
        callback()
    )

  execute: (req, res)=>
    route = Vakoo.router.fetch req.url
    if route? and route[1]
      try
        context = new (Vakoo.getClass "context") req, res, route
        Controller = Vakoo.getAppClass context.route.controller, "controllers"
        if Controller?
          (new Controller context, Vakoo.createLogger(context.route.controller, "Controller"))[route[1].action]()
        else
          @logger.error "Controller `#{route[1].controller}` not found."
          throw new Error "Controller `#{route[1].controller}` not found."
      catch e
        #TODO 404
        @logger.error e.toString()
        res.send "404 with #{e}"
    else
      #TODO 404
      @logger.warn "Route with url `#{req.url}` not found."
      res.send "Route with url `#{req.url}` not found. 404 Error."

module.exports = Web