TemplateDecorator = require "../decorators/template"
RedisDecorator = require "../vakoo/decorators/redis"

async = require "async"

class ContextDecorator

  constructor: (@context)->

    @logger = Vakoo.createLogger "Context", "Decorator"

    @logger.profile "query"

    @templateDecorator = new TemplateDecorator @context

    @redisDecorator = new RedisDecorator Vakoo.Storage.redis.client

    @context.city = {
      title: "Ижевск"
      titles:
        from: "Ижевска"
        to: "Ижевск"
    }

  showTemplate: (templateName, data)=>
    @logger.info "Start show template `#{templateName}`"
    async.waterfall(
      [
        async.apply async.parallel,
          {
            layout: async.apply @templateDecorator.getLayout, "all"
            common: @templateDecorator.getCommonData
            head: (taskCallback)->
              taskCallback null, {
                title: "Title"
                meta:
                  description: "desc"
                  words: "words"
                  title: "meta title"
              }
            template: async.apply @templateDecorator.getTemplate, templateName
          }

        ({layout, common, head, template}, taskCallback)=>

          data.common = common

          html = layout {
            common
            head
            content: template data
          }

          taskCallback null, html

      ]
      (err, html)=>
        @logger.profile "query"
        @context.sendHandler err, html
    )


module.exports = ContextDecorator