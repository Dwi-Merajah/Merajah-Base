const models = {
   users: {
      afk: -1,
      afkReason: '',
      afkObj: {},
      banned: false,
      ban_temporary: 0,
      ban_times: 0,
      premium: false,
      expired: 0,
      lastseen: 0,
      hit: 0,
      warning: 0
   },
   groups: {
      activity: 0,
      antidelete: true,
      antilink: false,
      antivirtex: false,
      antitagsw: true,
      left: false,
      mute: false,
      member: {},
      text_left: '',
      text_welcome: '',
      welcome: true,
      expired: 0,
      stay: false
   },
   chats: {
      chat: 0,
      lastchat: 0,
      lastseen: 0
   },
   setting: {
      autobackup: false,
      autodownload: true,
      antispam: true,
      debug: false,
      error: [],
      hidden: [],
      pluginDisable: [],
      receiver: [],
      groupmode: false,
      sk_pack: 'Sticker by',
      sk_author: '© Merajah/Baileys',
      self: false,
      online: true,
      onlyprefix: '+',
      owners: [''],
      lastReset: new Date * 1,
      cover: '',
      link: ''
   }
}

module.exports = { models }