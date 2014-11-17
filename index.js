require('./vendor/x-tag-core')

var Handlebars = require('hbsfy/runtime')
Handlebars.registerHelper('ifEqual', function(v1, v2, options) {
  if (v1 === v2) {
    return options.fn(this)
  }
  return options.inverse(this)
})

require('./compose-shell')
require('./compose-shell-param')
require('./compose-shell-button')