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

    @app.all "*", @executor

    @server = @app.listen(
      @port
      =>
        @logger.info "Start listening port `#{@port}`"
        callback()
    )

  executor: (req, res)=>
    res.send "It's working!"

module.exports = Web