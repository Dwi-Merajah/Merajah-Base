'use strict'

module.exports = {
  meta: {
    name: 'ping',
    command: ['ping'],
    help: ['ping'],
    tag: ['misc'],
    use: '',
    limit: 1
  },

  async execute(m, { client }) {
      const start = Date.now()
      const msg = await client.sendMessage(m.chat, { text: "checking......" }, { quoted: m })
      const end = Date.now()
      client.sendMessage(m.chat, {
         text: `✨ Speed : [ ${end - start}ms ]`,
         edit: msg.key
      })
   }
}