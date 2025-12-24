global.Func = require("./meta/function")
global.owner = ["6285133663664"]

global.Api = new(require('./meta/neoxrApi'))("https://api.neoxr.eu/api", "@Merajah/Baileys")

global.status = Object.freeze({
   fail: Func.Styles('Failed to process the request.'),
   wait: Func.Styles('Please wait, processing...'),
   owner: Func.Styles('This command only for owner.'),
   premium: Func.Styles('This feature only for premium user.'),
   group: Func.Styles('This command will only work in groups.'),
   botAdmin: Func.Styles('This command will work when I become an admin.'),
   admin: Func.Styles('This command only for group admin.'),
   private: Func.Styles('Use this command in private chat.')
})