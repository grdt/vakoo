async = require "async"


class StorageParent

class Storage

  constructor: ->
    @Extender = StorageParent
    @connectors ?= []

  add: (name, storage)=>
    @[name] = storage
    @connectors.push storage.connect

  connect: (callback)=>
    async.parallel(
      @connectors
      (err)->
        callback err
    )


module.exports = new Storage()