async = require "async"
_ = require "underscore"
crypto = require "crypto"
Controller = Vakoo.getClass "controller"
moment = require "moment"
TemplateDecorator = require "../decorators/template"
ContextDecorator = require "../decorators/context"

class Billing extends Controller

  params =
    MerchantLogin: "luxy.sexy"
    OutSum: 0.0 #сумма заказа
    InvId: 1 #order id
    InvDesc: "Order" #описание покупки
    pass1: "085bdb2261"

  constructor: ->

    super

    @contextDecorator = new ContextDecorator @context
    @templateDecorator = new TemplateDecorator @context


    @mongo = Vakoo.Storage.mongo
    @orderCollection = @mongo.collection "orders"

    @config = Vakoo.getConfig "shop"

    @roboParams =
#      login: "luxy.sexy"
      login: "luxy.test"
      pass1: "085bdb2261"
      pass2: "webadmin45"
      url: "http://test.robokassa.ru/Index.aspx"


  index: ->
    orderId = "54e786369c3714c54aa7415a"

    ObjectId = new @mongo.ObjectID orderId

    async.waterfall(
      [
        (taskCallback)=>
          @orderCollection.findOne ObjectId, taskCallback
        (order, taskCallback)=>
          params = @createParams order

          query = _.map(
            _.pairs params
            (pair)->
              return pair.join "="
          ).join "&"

          url = "#{@roboParams.url}?#{query}"
          taskCallback null, url
      ]
      (err, url)=>
        if err
          @logger.error err
          @contextDecorator.showError err
        else
          @logger.info url
          @contextDecorator.showTemplate "billing.index", {url}
    )

  answer: ->
    if @post()
      @logger.info "Answer request."
      switch @get "act"
        when "result"
          if @createCheckSign() is @post("SignatureValue").toLowerCase()
            @logger "Order `#{@post "InvId"}` pay successfully."
            @echo "OK#{@post "InvId"}"
          else
            @error "Closed."
        when "success"
          console.log "success"
        when "fail"
          console.log "fail"
        else
          @logger.error "Unknown act `#{@get "act"}`"
          @error "Unknown params"
    else
      @logger.error "Not POST in answer."
      @error()

  createParams: (order)=>
    return {
      MerchantLogin: @roboParams.login
      OutSum: order.total
      InvId: @orderTimestamp order
      InvDesc: escape(@config.paymentWord.replace "%num%", @getHumanOrderId order)
      SignatureValue: @createSign order
    }

  getHumanOrderId: (order)=>
    ts = ("" + (@orderTimestamp order)).split ""
    return "#{ts[0..2].join("")}-#{ts[3..5].join("")}-#{ts[6..9].join("")}"

  createSign: (order)=>
    md5 = crypto.createHash "md5"

    md5.update "#{@roboParams.login}:#{order.total}:#{@orderTimestamp order}:#{@roboParams.pass1}"

    return md5.digest "hex"

  createCheckSign: =>
    md5 = crypto.createHash "md5"

    md5.update "#{@post "OutSum"}:#{@post "InvId"}:#{@roboParams.pass2}"

    return md5.digest "hex"

  orderTimestamp: (order)=>
    return Math.floor(order._id.getTimestamp().getTime() / 1000)


module.exports = Billing