class MongoCollection

  constructor: (@client, @collectionName)->
    @collection = @client.collection @collectionName


  find: (query, fields ..., callback)=>

    fields = fields[0] ? null

    @collection.find query, fields, (err, cursor)->
      if err
        callback err
      else
        cursor.toArray callback


class MongoDecorator

  constructor: (@client)->


  collection: (name)=>
    return new MongoCollection @client, name


module.exports = MongoDecorator