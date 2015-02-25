MongoClient = require('mongodb').MongoClient
request = require "request"
async = require "async"
_ = require "underscore"
parseString = require('xml2js').parseString
fs = require "fs"
google = require "googleapis"
OAuth2 = google.auth.OAuth2
oauth2Client = new OAuth2("369918028503-34mnodtfft061n53ko96ms267jnme9h8.apps.googleusercontent.com", "9LDxcunVacvKTYWaMGoCDuXp", "http://vakoo.ru/admin/?task=shop.seo/googleAuth");


scopes = [
  "https://www.googleapis.com/auth/webmasters.readonly"
  "https://www.googleapis.com/auth/webmasters"
  "https://www.googleapis.com/auth/siteverification"
];

#url = oauth2Client.generateAuthUrl({
#  access_type: 'offline'
#  scope: scopes
#})




webmaster = google.webmasters "v3"

verification = google.siteVerification "v1"

mongo = false

auth = true

async.waterfall(
  [
    (callback)->
      unless auth
        async.waterfall(
          [
#            (cb)->
#              oauth2Client.refreshAccessToken cb
            (cb)->
              tokens =
                access_token: 'ya29.IQFVrGVoF9J242-x8iodeJ7PVNlBfAvb2vec9hGjpeX3ua6WH0j2z0v-DjPI1efgLH8526WmsV918w'
                token_type: 'Bearer'
                expiry_date: 1424528439229
              oauth2Client.setCredentials(tokens)
              google.options auth: oauth2Client
              cb()
          ]
          callback
        )
      else
        async.waterfall(
          [
            (cb)->
              url = oauth2Client.generateAuthUrl({
                access_type: 'offline'
                scope: scopes
              })
              console.log url
              cb()

            (cb)->
              code = "4/wTZdp0aVtI1GpU6MIIr57aaYzafLGZrYgaOdUEH08PU.8sgG2Ft_g9sdrjMoGjtSfTqMrylZlwI"
              cb null, code
            (code, cb)->
              oauth2Client.getToken code, cb
            (tokens, cb)->
              console.log tokens
              oauth2Client.setCredentials(tokens)
              google.options auth: oauth2Client
              cb()
          ]
          callback
        )

    (cb)->
      MongoClient.connect "mongodb://localhost:27017/vakoo", cb
    (db, cb)->
      mongo = db
      cb()

    async.apply async.parallel, {
      googleSites: (taskCallback)->
        webmaster.sites.list {}, (err, response)->
          if err
            taskCallback err
          else
            taskCallback null, response.siteEntry
      luxySites: (taskCallback)->
        mongo.collection("cities").find {}, {alias: 1}, (err, cursor)->
          if err
            taskCallback err
          else
            cursor.toArray taskCallback
    }

    (results, cb)->

      mustAdded = []
      mustDeleted = []

      aliases = _.map(
        results.luxySites
        (site)->
          return "http://#{site.alias}.luxy.sexy/"
      )

      aliases.push "http://www.luxy.sexy/"

      sites = _.map(
        results.googleSites
        (site)->
          return site.siteUrl
      )

      async.parallel(
        [
          (taskCallback)->
            async.each(
              aliases
              (alias, done)->
                if alias not in sites
                  mustAdded.push alias
                done()
              taskCallback
            )
          (taskCallback)->
            async.each(
              sites
              (site, done)->
                if site not in aliases
                  mustDeleted.push site
                done()
              taskCallback
            )
        ]
        (err)->
          cb err, {
            mustAdded: mustAdded
            mustDeleted: mustDeleted
          }
      )
    (results, cb)->
      async.parallel(
        [
          (taskCallback)->
            async.each(
              results.mustAdded
              (site, done)->
                console.log "add to google `#{site}`"
                webmaster.sites.add {siteUrl: site}, done
              taskCallback
            )

          (taskCallback)->
            async.each(
              results.mustDeleted
              (site, done)->
                console.log "delete from google `#{site}`"
                webmaster.sites.delete {siteUrl: site}, done
              taskCallback
            )
        ]
        cb
      )
    (r, cb)->
      webmaster.sites.list {}, (err, response)->
        if err
          taskCallback err
        else
          cb null, response.siteEntry
    (googleSites, cb)->
      async.each(
        googleSites
        (site, done)->
          if site.permissionLevel is "siteUnverifiedUser"
            console.log "verify #{site.siteUrl}"
            verification.webResource.insert {verificationMethod: "FILE", resource: {site: {identifier: site.siteUrl, type: "SITE"}}}, done
          else
            done()
        cb
      )
    (cb)->
      console.log "done"
  ]
  (err)->
    console.error err
)