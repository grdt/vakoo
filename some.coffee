#!/usr/bin/coffee
MongoClient = require('mongodb').MongoClient
async = require "async"
mongo = null
async.waterfall(
  [
    async.apply MongoClient.connect, "mongodb://localhost:27017/vakoo"
    (db, taskCallback)->
      mongo = db
      db.collection("cities").find {}, taskCallback
    (cursor, taskCallback)->
      cursor.toArray taskCallback
    (cities, taskCallback)->
      async.each(
        cities
        (city, done)->
          mongo.collection("cities").update(
            {_id: city._id}
            {$set: {loc:{lng:city.longitude, lat: city.latitude}}}
            done
          )
        taskCallback
      )
  ]
  (err, res)->
    console.log err, res
)