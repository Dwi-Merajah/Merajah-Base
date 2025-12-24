'use strict'

module.exports = {
  meta: {
    name: 'afk',
    command: ['afk'],
    help: ['afk'],
    tag: ['misc'],
    use: '<reason>'
  },

  async execute(m, {
    client,
    text,
    database
  }) {
    try {
      let user = global.db.users.find(v => v.jid == m.sender)
      user.afk = +new Date
      user.afkReason = text
      user.afkObj = m
      await database.saveOnce(user)
      let tag = m.sender.split`@` [0]
      return client.reply(m.chat, `🚩 @${tag} is now AFK!`, m)
    } catch {
      client.reply(m.chat, global.status.error, m)
    }

  }
}