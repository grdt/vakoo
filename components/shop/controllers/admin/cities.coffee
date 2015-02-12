#CoreController = require "./system/core/controller.js"

ShopCitiesAdminController = (@context)->

  @VIEW_NAMESPACE = "cities"


  @index = ->

    @display("list")


  return
module.exports = ShopCitiesAdminController