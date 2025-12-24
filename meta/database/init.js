module.exports = class Init {
   getModel = (object = {}) => JSON.parse(JSON.stringify(object))
   execute = (prefix, template, custom = {}) => {
      const validTemplate = Object.assign({}, template)
      const validCustom = Object.assign({}, custom)

      Object.keys(validTemplate).forEach(key => {
         if (!(key in prefix)) {
            prefix[key] = validTemplate[key]
         }
      })

      Object.keys(validCustom).forEach(key => {
         if (!(key in prefix)) {
            prefix[key] = validCustom[key]
         }
      })
   }
}