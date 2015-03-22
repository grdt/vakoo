async = require "async"
Path = require "path"
fs = require "fs"
_ = require "underscore"

StorageDecorator = require "./storage"
RedisDecorator = require "../vakoo/decorators/redis"

Handlebars = require "handlebars"
HandlebarsHelpers = require "handlebars-helper"
HandlebarsHelpers.help Handlebars


class TemplateDecorator

  constructor: (@context)->
    @logger = Vakoo.createLogger "template", "decorator"
    @templatePath = Path.resolve APP_PATH, "templates"
    @layoutPath = Path.resolve @templatePath, "layouts"
    @modulePath = Path.resolve @templatePath, "modules"
    @tmplExtname = "hbr"
    @storageDecorator = new StorageDecorator

    @redis = Vakoo.Storage.redis.client
    @redisDecorator = new RedisDecorator @redis
    @redisTtl = Vakoo.Storage.redis.config.ttl

    Handlebars.registerHelper 'keyinRange', (context, skip, limit, options) ->
      if typeof limit == 'object'
        options = limit
        limit = skip - 1
        skip = 0
      ret = ''
      i = 0
      for key of context
        if i <= limit and i >= skip
          ret = ret + options.fn(context[key])
        i++
      ret
    Handlebars.registerHelper 'keyIn', (context, options) ->
      ret = ''
      for key of context
        ret = ret + options.fn(context[key])
      ret
    Handlebars.registerHelper 'keyin', (context, options) ->
      ret = ''
      for key of context
        ret = ret + options.fn(context[key])
      ret

    Handlebars.registerHelper 'isset', (context, options) ->
      if typeof context != 'undefined'
        options.fn this
      else
        options.inverse this

    Handlebars.registerHelper 'second', (context, options) ->
      i = 0
      for key of context
        if i == 1
          return options.fn(context[key])
        i++
      return

  getLayout: (name, callback)=>

    path = Path.resolve @layoutPath, "#{name}.#{@tmplExtname}"

    @readIfExists path, (err, source)->
      callback err, Handlebars.compile source

  getModule: (name, callback)=>

    path = Path.resolve @modulePath, "#{name}.#{@tmplExtname}"

    @readIfExists path, (err, source)->
      callback err, Handlebars.compile source

  getTemplate: (name, callback)=>

    name = name.replace ".", "/"

    path = Path.resolve @templatePath, "#{name}.#{@tmplExtname}"

    @readIfExists path, (err, source)->
      callback err, Handlebars.compile source

  getCommonData: (callback)=>

    async.parallel(
      {
        footer: @getFooter
        search: async.apply @readIfExists, Path.resolve(@modulePath, "search.#{@tmplExtname}")
        toolBar: async.apply @readIfExists, Path.resolve(@modulePath, "toolbar.#{@tmplExtname}")
        catalogMenu: @getCatalogMenu
        breadCrumbs: @getBreadcrumbs
      }
      callback
    )

  getBreadcrumbs: (callback)=>

    async.waterfall(
      [
        async.apply(
          @redisDecorator.getex
          "template-common-data-breadcrumbs"
          (redisCallback)=>
            @readIfExists Path.resolve(@modulePath, "breadcrumbs.#{@tmplExtname}"), redisCallback
          @redisTtl
        )
        (source, taskCallback)=>

          template = Handlebars.compile source
          #todo make getters
          history = [
            {url: "/someUrl", title: "someTitle"}
            {url: "/someUrl", title: "someTitle"}
            {url: "/someUrl", title: "someTitle"}
            {url: "/someUrl", title: "someTitle"}
            {url: "/someUrl", title: "someTitle"}
            {url: "/someUrl", title: "someTitle"}
          ]
          crumbs = [
            {
              url: "/aza"
              title: "title"
            }
            {
              url: "/aza/aza"
              title: "title2"
            }
          ]
          callback null, template {history, crumbs}
      ]
      callback
    )



  getCatalogMenu: (callback)=>
    @redisDecorator.getex(
      "template-common-data-catalog-menu"
      (redisCallback)=>
        async.waterfall(
          [
            async.apply async.parallel, {
              template: async.apply @getModule, "catalog_menu"
              pages: @storageDecorator.getPagesShortByAlias
              categoriesTree: @storageDecorator.getCategoriesTree
              city: (taskCallback)=>
                taskCallback null, @context.city
            }
            ({pages, template, city, categoriesTree}, taskCallback)=>
              try

                html = template({
                  pages
                  city
                  categoriesTree
                })

                taskCallback null, html
              catch e
                @logger.error e.toString()
                taskCallback e.toString()

          ]
          redisCallback
        )
      @redisTtl
      callback
    )

  getFooter: (callback)=>

    @redisDecorator.getex(
      "template-common-data-footer"
      (redisCallback)=>
        async.waterfall(
          [
            async.apply async.parallel, {
              pages: @storageDecorator.getPagesShortByAlias
              template: async.apply @getModule, "footer"
              city: (taskCallback)=>
                taskCallback null, @context.city
            }
            ({pages, template, city}, taskCallback)=>
              try

                html = template({
                  pages
                  city
                })

                taskCallback null, html
              catch e
                @logger.error e.toString()
                taskCallback e.toString()
          ]
          redisCallback
        )
      @redisTtl
      callback
    )




  readIfExists: (path, callback)=>

    fs.exists path, (exists)=>
      if exists
        fs.readFile path , encoding: "utf8", callback
      else
        @logger.error "File `#{path}` not exists"
        callback "File `#{path}` not exists"

module.exports = TemplateDecorator