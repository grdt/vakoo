###*
@module altha
@submodule decorators
###

_ = require "underscore"
async = require 'async'

###*
Декоратовы редиса
@class altha.decorators.Redis
@constructor
###
class RedisDecorator


  ###*
  Конструктор класса
  @method constructor
  @param client {Object} экземпляр клиента редиса
  ###
  constructor: (@client)->

    ###*
    Возвращает значение из редиса по ключу, в случае его отсутсвия/ошибки - используется геттер, переданный в параметрах
    @method get
    @param client {Object} экземпляр клиента редиса
    @param key {String} ключ значения
    @param getter {Function} функция получения значение при ошибке или отсутствию значения в редисе
    @param callback {Function} каллбэк
    @async
    ###
  get: (key, getter, callback)=>
    if @client.connected
      @client.get key, (error, result)=>
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
              if err or not result?
                callback err
              else
                if _.isArray(result) or _.isObject(result)
                  redisValue = JSON.stringify redisResult:result
                @client.set key, redisValue ? result, (err)->
                  callback err, result
    else
      getter callback

  ###*
  Возвращает значение из редиса по ключу, в случае его отсутсвия/ошибки - используется геттер, переданный в параметрах.
  Переменная записывается в редис на указанное время.
  @method getex
  @param key {String} ключ значения
  @param getter {Function} функция получения значение при ошибке или отсутствию значения в редисе
  @param ttl {Intiger} время жизни значения в секундах
  @param callback {Function} каллбэк
  @async
  ###
  getex: (key, getter, ttl, callback)=>
    if @client.connected
      @client.get key, (error, result)=>
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
              if err or not result?
                callback err
              else
                if _.isArray(result) or _.isObject(result)
                  redisValue = JSON.stringify redisResult:result
                @client.setex key, ttl, redisValue ? result, (err)->
                  callback err, result
    else
      getter callback

  ###*
  @method hmset
  @param key {String} ключ значения
  @param value {Object|Array} значение, которое необходимо записать в редис
  @param callback {Function} каллбэк
  @async
  ###
  hmset: (key, value, callback)=>
    if @client.connected
      params = [key]

      if _.isArray(value)
        params = params.concat(value)
      else if _.isObject(value)
        for k, v of value
          params.push k
          params.push v
      else
        params.push value

      params.push callback

      @client.hmset.apply @client, params
    else
      callback 'Redis not connected'

  ###*
  Получает список ключей по префиксу, т.е. выполняет комманду `KEYS prefix*`.
  Если передать пустой префикс, то вернёт список всех ключей.
  Подробнее см. [тут]:(http://redis.io/commands/KEYS)
  @method getKeysByPrefix
  @param prefix {String} префикс
  @param callback {Function} каллбэк
  @async
  ###
  getKeysByPrefix: (prefix, callback)=>
    if @client.connected
      @client.keys "#{prefix}*", callback
    else
      callback 'Redis not connected'

  ###*
  Получает список ключей по паттерну, т.е. выполняет комманду `KEYS pattern`.
  Подробнее см. [тут]:(http://redis.io/commands/KEYS).
  @method getKeysByPattern
  @param pattern {String} паттерн
  @param callback {Function} каллбэк
  @async
  ###
  getKeysByPattern: (pattern, callback)=>
    if @client.connected
      @client.keys pattern, callback
    else
      callback 'Redis not connected'

  ###*
  Получает список объектов по ключам (объекты конструируются из сохранённых хэшей)
  Подробнее см. [тут]:(http://redis.io/commands/HGETALL).
  @method getHValuesByKeys
  @param keys {Array} Список ключей, объекты которых необходимо извлечь
  @param callback {Function} Коллбек
  @async
  ###
  getHValuesByKeys: (keys, callback)=>
    if @client.connected
      async.map(
        keys,
      (key, mCallback)=>
        @client.hgetall key, mCallback
        callback
      )
    else
      callback 'Redis not connected'

module.exports = RedisDecorator
