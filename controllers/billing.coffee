class Billing extends Vakoo.getClass "controller"

  index: ->
    @logger.info "Its my logger"
    @where()

module.exports = Billing