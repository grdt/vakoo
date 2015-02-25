#CoreController = require "./system/core/controller.js"

async = require "async"
request = require "request"
parseString = require('xml2js').parseString

ObjectID = require('mongodb').ObjectID

#google path
google = require "googleapis"

OAuth2 = google.auth.OAuth2
oauth2Client = new OAuth2("369918028503-34mnodtfft061n53ko96ms267jnme9h8.apps.googleusercontent.com", "9LDxcunVacvKTYWaMGoCDuXp", "http://vakoo.ru/admin/?task=shop.seo/googleAuth")

gooToken = "ya29.IQFVrGVoF9J242-x8iodeJ7PVNlBfAvb2vec9hGjpeX3ua6WH0j2z0v-DjPI1efgLH8526WmsV918w"

token =
  access_token: gooToken
  token_type: "Bearer"
  expiry_date: 1424528439229

oauth2Client.setCredentials token

google.options auth: oauth2Client

webmaster = google.webmasters "v3"
#end google



ShopCitiesAdminController = (@context)->

  @VIEW_NAMESPACE = "cities"

  @mongo = @vakoo.load.db.interface

  PER_PAGE = 50

  yaToken = "b57c144f86264bcbabcd54910b6401e3"

  yandexSites = []

  @edit = ->

    @createReturnUrl();

    async.waterfall(
      [
        (taskCallback)=>
          @mongo.collection("cities").findOne {_id:new ObjectID(@get("id"))}, taskCallback
        (city, taskCallback)=>
          if @post()

            city.title_in = @post("title_in", city.title_in)
            city.title_from = @post("title_from", city.title_from)
            city.region = @post("region", city.region)

            @mongo.collection("cities").update(
              {_id:new ObjectID(@get("id"))}
              {$set:{
                title_in:@post("title_in", city.title_in)
                title_from:@post("title_from", city.title_from)
                region:@post("region", city.region)
              }},
              (err)->
                taskCallback err, {city: city}
            )
          else
            taskCallback null, {city: city}
      ]
      (err, data)=>
        if err
          console.error err
          @setFlash('error',"Ошибка: `#{err}`");
        else if @post()
          @setFlash('success',"Город `#{data.city.name_ru}` сохранен");

          #todo remove this
#          async.waterfall(
#            [
#              (taskCallback)=>
#                @mongo.collection("cities").count {"title_in":""}, taskCallback
#              (count, taskCallback)=>
#                @setFlash('info',"Осталось #{count}");
#                taskCallback()
#              (taskCallback)=>
#                @mongo.collection("cities").findOne {"title_in":""}, taskCallback
#            ]
#            (err, city)=>
#              if err
#                console.error err
#                @setFlash('error',"Ошибка: `#{err}`");
#              @redirect "/admin/?task=shop.cities/edit&id=#{city._id}"
#          )
#          return

        if @post("exit") is "1"
          @back()
        else
          @display("form", data)
    )

  @cityList = ->

    pager = false

    async.waterfall(
      [
        async.apply @getPagination, @mongo.collection("cities"), {"title_in":""}, PER_PAGE, @get("p", 0)
        (results, taskCallback)=>
          pager = results
          @mongo.collection("cities").find {"title_in":""}, taskCallback
        (cursor, taskCallback)->
          cursor.skip pager.limit[0]
          cursor.limit pager.limit[1]
          cursor.toArray taskCallback
        (cities, taskCallback)->
          taskCallback null, {
            cities:cities
            pagination: pager.pagination
          }
      ]
      (err, data)=>
        if err
          console.error err
        @display("list", data)
    )

  @index = ->

    if @get("padezh") is 1
      @cityList()
      return

    @cleanTimeout()

    pager = false

    async.waterfall(
      [
        async.apply @getPagination, @mongo.collection("cities"), {}, PER_PAGE, @get("p", 0)
        (results, taskCallback)=>
          pager = results
          @mongo.collection("cities").find {}, taskCallback
        (cursor, taskCallback)->
          cursor.skip pager.limit[0]
          cursor.limit pager.limit[1]
          cursor.toArray taskCallback

        @getYandexStats

        @getGoogleStats

        (cities, taskCallback)->
          taskCallback null, {
            cities:cities
            pagination: pager.pagination
          }
      ]
      (err, data)=>
        if err
          console.error err
        @display("list", data)
    )

  @getYandexStats = (cities, callback)=>
    async.each(
      cities
      (city, done)=>

        async.waterfall(
          [
            (taskCallback)=>
              if city.yandexId
                taskCallback null, city.yandexId
              else
                async.waterfall(
                  [
                    @getYandexSites
                    (yaSites, subTaskCallback)->
                      byAlias = _.filter yaSites, (site)->
                        alias = site.name[0].split(".")[0]
                        return city.alias is alias
                      subTaskCallback null, _.last(byAlias[0].$.href.split("/"))
                    (yandexId, subTaskCallback)=>
                      city.yandexId = yandexId
                      @mongo.collection("cities").update(
                        {_id: city._id}
                        {$set: {yandexId: city.yandexId}}
                        subTaskCallback
                      )
                  ]
                  (err)->
                    taskCallback err, city.yandexId
                )
            (yandexId, taskCallback)=>
              @getFromRedis(
                "yandex-host-#{city.yandexId}"
                (redisCallback)->
                  async.waterfall(
                    [
                      (subTaskCallback)->
                        console.log "receive yandex stats for `#{city.alias}.luxy.sexy`"
                        request.get(
                          "http://webmaster.yandex.ru/api/v2/hosts/#{city.yandexId}/stats"
                          {
                            headers:{
                              Authorization: "OAuth #{yaToken}"
                            }
                          }
                          subTaskCallback
                        )
                      (response, body, subTaskCallback)->
                        parseString body, subTaskCallback
                      (yaResult, subTaskCallback)->
                        subTaskCallback null, yaResult.host
                    ]
                    redisCallback
                  )
                (err, yandex)->
                  taskCallback err, yandex
              )
          ]
          (err, stats)->
            city.yandex = stats
            done err
        )
      (err)->
        callback err, cities
    )

  @getGoogleStats = (cities, callback)=>
    callback null, cities

  @getYandexSites = (callback)=>
    @getFromRedis(
      "yandex-sites"
      (redisCallback)->
        async.waterfall(
          [
            (taskCallback)->
              request.get(
                "http://webmaster.yandex.ru/api/v2/hosts"
                {
                  headers:{
                    Authorization: "OAuth #{yaToken}"
                  }
                }
                taskCallback
              )
            (response, body, taskCallback)->
              parseString body, taskCallback
          ]
          (err, result)->
            yandexSites = result.hostlist.host
            redisCallback err, yandexSites
        )
      callback
    )

  @getPagination = (collection, query, perPage, page, callback)=>

    limit = [0, perPage]
    pagination = false

    async.waterfall(
      [
        (taskCallback)->
          collection.count query, taskCallback

        (count, taskCallback)->
          if perPage < count
            limit = [page * perPage, perPage];
            pagination = {page: page + 1, count: count, perPage: perPage}
          taskCallback null, {pagination: pagination, limit: limit}
      ]
      callback
    )

  @getFromRedis = (key, getter, callback)->

    client = @vakoo.redis
    ttl = 60 * 60 * 24 * 2

    client.get key, (error, result)=>
      if error
        getter callback
      else
        if result?
          try
            result = JSON.parse result
            result = if result.redisResult? then result.redisResult else result
          callback null, result
        else
          getter (err, result)=>
            if err
              callback err
            else
              if _.isArray(result) or _.isObject(result)
                storeResult = redisResult:result
                storeResult = JSON.stringify storeResult
              client.setex key, ttl, storeResult, (err)->
                callback err, result

  return
module.exports = ShopCitiesAdminController