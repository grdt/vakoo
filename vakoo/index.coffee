winston = require "winston"
async = require "async"
Path = require "path"
fs = require "fs"
_ = require "underscore"

class Vakoo

  constructor: ->
    @initLoggers()

    @logger = winston.loggers.get "Vakoo"
    @initializers = []

  initLoggers: =>

    loggers = [
      "Vakoo"
      "Redis"
      "Mongo"
      "Router"
      "Context"
      "Initialize"
      "Web"
      "Mailer"
    ]

    len = (_.max loggers, (logger)->
      return logger.length).length

    labels = _.object _.map loggers, (logger)->
      return [logger, logger]
#      return [logger, "#{(new Array (len - logger.length + 1)).join " "}#{logger}"]

    @loggers = {}

    for logger in loggers
      winston.loggers.add logger, {
        console: {
          colorize: true
          label: labels[logger]
        }
      }

      @loggers[logger] = winston.loggers.get logger

    @logger = @loggers.Vakoo

  createLogger: (name, postfix)=>

    firstUpper = (string)->
      arr = string.split ""
      return "#{arr[0].toUpperCase()}#{_.rest(arr).join("").toLowerCase()}"

    label = "#{firstUpper name}#{firstUpper postfix}"

    return new winston.Logger(
      {
        transports: [
          new winston.transports.Console(
            colorize: true
            label: label
          )
        ]
        exitOnError: false
      }
    )

  init: (callback)=>

    tasks = [
      (taskCallback)=>
        @logger.info "Start initialization."
        taskCallback()
    ]

    tasks.push async.apply(@Storage.connect)

    if @initializers.length
      for initializer in @initializers
        tasks.push async.apply(initializer)

    if @web?
      tasks.push @web.start

    async.waterfall(
      tasks
      callback
    )


  addStorage: (name, configName..., callback)=>

    configName = configName[0] ? name

    @Storage ?= @getClass "storage"

    if @Storage[name]?
      callback "Storage `#{name}` already added."
    else
      config = @getConfig configName
      Storage = @getClass config.class
      storage = new Storage config
      @Storage.add name, storage
      @logger.info "Add storage `#{name}` with config `#{configName}`"
      callback()

  initialize: (callback)=>
    fs.readdir Path.resolve(APP_PATH, "initializers"), (err, files)=>
      if err
        callback err
      else
        async.each(
          files
          (file, done)=>
            Initializer = require Path.resolve(APP_PATH, "initializers", file)
            @initializers.push (initCallback)=>
              new Initializer initCallback
            done()
          callback
        )


  createServer: (callback)=>
    config = @getConfig "web"
    Web = @getClass "web"
    @web = new Web config, callback

  enableSMTP: (callback)=>
    Mailer = @getClass "mailer"
    config = @getConfig "smtp"
    @mailer = new Mailer config, callback

  initRouter: (callback)=>
    Router = @getClass "router"
    config = @getConfig "routes"
    @router = new Router config, callback

  getClass: (name)->
    return require Path.resolve VAKOO_PATH, "classes/#{name}"

  getConfig: (name)->
    return require Path.resolve APP_PATH, "config/#{name}.json"

  getAppClass: (name, path)->
    return require Path.resolve APP_PATH, "#{path}/#{name}"



vakoo = new Vakoo()
#TODO global beauty
global.Vakoo = vakoo
global.APP_PATH = Path.resolve __dirname, ".."
global.VAKOO_PATH = __dirname

module.exports = vakoo