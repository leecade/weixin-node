'use strict'
module.exports = {

  /**
   * Format datas with a template
   */
  replaceTpl: function(tpl, data, label) {
    var t = String(tpl),
      s = label || /#\{([^}]*)\}/mg,
      trim = String.trim ||
      function(str) {
          return str.replace(/^\s+|\s+$/g, "")
      }
    return t.replace(s, function(value, name) {
      value = data[trim(name)]
      // only handle `undefined`
      return value === undefined ? "" : value
    })
  }
}
