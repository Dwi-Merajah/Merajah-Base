'use strict'

module.exports = {
  meta: {
    name: 'afk',
    events: true
  },

  async execute(m, {
    client
  }) {
    try {
      let afk = [...new Set([...(m.mentionedJid || []), ...(m.quoted ? [m.quoted.sender] : [])])]
      for (let jid of afk) {
        let is_user = global.db.users.find(v =>
          v.jid == jid || v.lid === jid
        )
        if (!is_user) continue
        let afkTime = is_user.afk
        if (!afkTime || afkTime < 0) continue
        let reason = is_user.afkReason || ''
        if (!m.fromMe) {
          client.reply(m.chat, `*Away From Keyboard* : @${is_user.jid.split('@')[0]}\n• *Reason* : ${reason ? reason : '-'}\n• *During* : [ ${Func.toTime(new Date - afkTime)} ]`, m)
        }
      }
    } catch (e) {
      return client.reply(m.chat, Func.jsonFormat(e), m)
    }
  }
}