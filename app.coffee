console.log "\n\n"

if process.argv.indexOf("--production") >= 0
	process.env.NODE_ENV = "production";

vakoo = require('./system/index')()

vakoo.start()