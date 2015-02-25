MongoClient = require('mongodb').MongoClient
request = require "request"
async = require "async"
_ = require "underscore"
parseString = require('xml2js').parseString
fs = require "fs"


#google
google = require "googleapis"
OAuth2 = google.auth.OAuth2
oauth2Client = new OAuth2("369918028503-34mnodtfft061n53ko96ms267jnme9h8.apps.googleusercontent.com", "9LDxcunVacvKTYWaMGoCDuXp", "http://vakoo.ru/admin/?task=shop.seo/googleAuth");


tokens =
  access_token: 'ya29.IQFmxXfc3ZZMo7M0aAuxzQ6IYzCxTiV9TC6xRQdBb5W1S5nBt2X1M87FeDTEGvlxmNi5ZExt2QKUDQ'
  token_type: 'Bearer'
  expiry_date: 1424533152598

oauth2Client.setCredentials tokens
google.options auth: oauth2Client
webmaster = google.webmasters "v3"

#yandex

yaToken = "b57c144f86264bcbabcd54910b6401e3"

mongo = false

sitemaps = []

_sites = false

getYandexSites = (callback)->

  if _sites
    callback null, _sites
    return

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
      _sites = yandexSites
      callback err, yandexSites
  )

async.waterfall(
  [
    (cb)->
      MongoClient.connect "mongodb://localhost:27017/vakoo", cb
    (db, cb)->
      mongo = db
      cb()
    (cb)->
      mongo.collection("products").count {status:"active"}, cb
    (count, cb)->
      pages = count / 2000 + 1

      sitemaps = [
        "/sitemap-categories.xml"
        "/sitemap-articles.xml"
      ]

      for i in [1..pages]
        sitemaps.push "/sitemap-products#{i}.xml"
      cb()
    (cb)->
      mongo.collection("cities").find {}, {alias: 1, yandexId: 1}, cb
    (cursor, cb)->
      cursor.toArray cb
    (cities, cb)->
      async.each(
        cities
        (city, done)->
          async.parallel(
            [
              (parallelCallback)->
                async.waterfall(
                  [
                    (wfCb)->
                      if city.yandexId
                        wfCb null, city.yandexId
                      else
                        getYandexSites (err, yaSites)->
                          if err
                            wfCb err
                          else
                            byAlias = _.filter yaSites, (site)->
                              alias = site.name[0].split(".")[0]
                              return city.alias is alias
                            yaId = _.last(byAlias[0].$.href.split("/"))
                            mongo.collection("cities").update(
                              {_id:city._id}, {$set:{yandexId: yaId}}
                              (err)->
                                wfCb err, yaId
                            )
                    (yaId, wfCb)->
                      city.yandexId = yaId
                      request.get(
                        "http://webmaster.yandex.ru/api/v2/hosts/#{yaId}/sitemaps"
                        {
                          headers: {
                            Authorization: "OAuth #{yaToken}"
                          }
                        }
                        wfCb
                      )
                    (response, body, wfCb)->
                      parseString body, wfCb
                    (yaRes, wfCb)->
                      if yaRes.sitemaps.sitemap?
                        maps = _.map(
                          yaRes.sitemaps.sitemap
                          (map)->
                            return map.link[0].$.href.replace "http://#{city.alias}.luxy.sexy", ""
                        )

                        wfCb null, _.difference(sitemaps, maps)

                      else
                        wfCb null, sitemaps

                    (mustAdded, wfCb)->

                      unless mustAdded.length
                        wfCb()
                        return

                      async.each(
                        mustAdded
                        (url, done)->
                          request.post(
                            {
                              url: "https://webmaster.yandex.ru/api/v2/hosts/#{city.yandexId}/sitemaps/"
                              headers: {
                                Authorization: "OAuth #{yaToken}"
                              }
                              body: encodeURIComponent "<sitemap><link href=\"http://#{city.alias}.luxy.sexy#{url}\" /></sitemap>"
                            }
                            (err, res, body)->
                              if err
                                done err
                              else
                                if res.statusCode is 201
                                  console.log "add ya map `#{url}` for `#{city.alias}` success"
                                  done()
                                else
                                  console.error "ya for `#{city.alias}` answered `#{body}`"
                                  done body
                          )
                        wfCb
                      )
                  ]
                  parallelCallback
                )

#              (parallelCallback)->
#                async.waterfall(
#                  [
#
#                    async.apply webmaster.sitemaps.list, {siteUrl: "http://#{city.alias}.luxy.sexy/"}
#
#                    (gooRes, response, wfCb)->
#                      if _.isEmpty gooRes
#                        wfCb null, sitemaps
#                      else
#                        maps = _.map(
#                          gooRes.sitemap
#                          (map)->
#                            return map.path.replace "http://#{city.alias}.luxy.sexy", ""
#                        )
#
#                        wfCb null, _.difference(sitemaps, maps)
#                    (mustAdded, wfCb)->
#                      unless mustAdded.length
#                        wfCb()
#                        return
#                      async.each(
#                        mustAdded
#                        (url, done)->
#                          console.log "submit goo map `#{url}` for `#{city.alias}`"
#                          webmaster.sitemaps.submit {siteUrl: "http://#{city.alias}.luxy.sexy/", feedpath: "http://#{city.alias}.luxy.sexy#{url}"}, (err)->
#                            if err
#                              done err
#                            else
#                              console.log "add goo map `#{url}` for `#{city.alias}` success"
#                              done()
#                        wfCb
#                      )
#
#                  ]
#                  parallelCallback
#                )

            ]
            done
          )
        cb
      )
  ]
  (err)->
    if err
      console.error err
    console.log "done"
)