express = require "express"
multipart = require "connect-multiparty"
bodyParser = require "body-parser"
cookieParser = require "cookie-parser"
errorhandler = require "errorhandler"
http = require "http"

session = require "express-session"
MongoStore = (require "connect-mongo") session

class Web

  constructor: (@config, callback)->

    @logger = Vakoo.loggers.Web

    @port = @config.port ? 8773

    @app = express()

    @app.set "json spaces", 3

    @app.use bodyParser.json()
    @app.use bodyParser.urlencoded extended: true
    @app.use cookieParser()
    @app.use multipart uploadDir: APP_PATH + "/tmp"
    for publicPath in @config.public
      console.log "static", APP_PATH + "/#{publicPath}"
      @app.use express.static APP_PATH + "/#{publicPath}"
    @app.use errorhandler()

    callback()

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
      context = new (Vakoo.getClass "context") req, res, route
      Controller = Vakoo.getAppClass context.route.controller, "controllers"
      logger = Vakoo.createLogger context.route.controller, "Controller"
      (new Controller context, logger)[route[1].action]()
    else
      #TODO 404
      @logger.warn "Route with url `#{req.url}` not found."
      res.send "Route with url `#{req.url}` not found. 404 Error."

module.exports = Web