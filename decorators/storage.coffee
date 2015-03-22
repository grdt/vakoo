RedisDecorator = require "../vakoo/decorators/redis"
MongoDecorator = require "../vakoo/decorators/mongo"
async = require "async"
_ = require "underscore"

class StorageDecorator

  constructor: ->
    @mongo = Vakoo.Storage.mongo.client
    @redis = Vakoo.Storage.redis.client
    @redisDecorator = new RedisDecorator @redis
    @mongoDecorator = new MongoDecorator @mongo
    @redisTtl = Vakoo.Storage.redis.config.ttl
    @logger = Vakoo.createLogger "storage", "decorator"

  getPagesShort: (callback)=>
    @redisDecorator.getex(
      "pages-short-list"
      (redisCallback)=>
        @mongoDecorator.collection("pages").find(
          {
            status: "active"
            type: "article"
          }
          {
            anonce: 0
            content: 0
          }
          redisCallback
        )
      @redisTtl
      callback
    )

  getPagesShortByAlias: (callback)=>
    @getPagesShort (err, pages)->
      if err
        callback err
      else
        pages = _.mapObject(
          _.indexBy pages, "alias"
          (page)->
            page.url = "/#{page.alias}"
            return page
        )

        callback err, pages


  getCategoriesTree: (callback)=>
    @redisDecorator.getex(
      "categories-tree"
      (redisCallback)=>
        async.waterfall(
          [
            async.apply(
              @mongoDecorator.collection("categories").find
              {}
              {
                title: 1
                ancestors: 1
                parent: 1
              }
            )
            (categories, taskCallback)->
              rootCats = _.indexBy _.filter(
                categories
                (category)->
                  return not category.parent
              ), "_id"

              tree = _.mapObject(
                rootCats
                (rootCat)->
                  rootCat.path = "/#{rootCat._id}"
                  rootCat.childs = _.filter(
                    categories
                    (category)->
                      if category.parent is rootCat._id
                        category.path = "/#{category.ancestors.join("/")}/#{category._id}"
                        return true
                      else
                        return false
                  )
                  return rootCat
              )

              taskCallback null, tree

          ]
          redisCallback
        )
      @redisTtl
      callback
    )


module.exports = StorageDecorator