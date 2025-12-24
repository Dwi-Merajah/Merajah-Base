'use strict'
require('./config')
const chalk = require('chalk')

module.exports = async function handler(ctx) {
  const {
    m,
    sock,
    body,
    prefix,
    command,
    args,
    text,
    database,
    plugins
  } = ctx
  let client = sock
  /* =================== BASIC NORMALIZATION =================== */
  if (m.sender && m.sender.endsWith('lid')) {
    m.sender = client.getJid(m.sender) || m.sender
  }

  require('./meta/database/schema')(m, sock)

  const groupSet = global.db.groups.find(v => v.jid === m.chat)
  const chats = global.db.chats.find(v => v.jid === m.chat)
  const users = global.db.users.find(v => v.jid === m.sender)
  const setting = global.db.setting

  /* =================== ROLE =================== */
  const isROwner = (global.owner || [])
    .map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net')
    .includes(m.sender)

  const meta = m.isGroup ? client.store.groups?.[m.chat] : null
  const members = meta?.participants || []

  const find = id => {
    const jid = client.getJid(id)
    const lid = client.getLid(id)
    return members.find(p => p.jid === jid || p.id === lid) || {}
  }

  const user = m.isGroup ? find(m.sender) : {}
  const bot = m.isGroup ? find(client.user.id) : {}

  const isRAdmin = user.admin === 'superadmin'
  const isAdmin = isRAdmin || user.admin === 'admin'
  const isBotAdmin = !!bot.admin
  const isPrem = users?.premium || isROwner

  /* =================== CONTEXT EXTRA =================== */
  const extra = {
    ...ctx,
    isROwner,
    isAdmin,
    isBotAdmin,
    isPrem,
    client,
    users,
    groupSet,
    chats,
    setting,
    Func,
    Api
  }

  /* =================== EXPIRED HANDLER =================== */
  if (m.isGroup && groupSet && !groupSet.stay &&
      groupSet.expired > 0 && Date.now() >= groupSet.expired) {
    await client.reply(m.chat,
      '🚩 Bot time has expired and will leave this group.',
      null
    )
    groupSet.expired = 0
    await Func.delay(2000)
    return client.groupLeave(m.chat)
  }

  if (users && users.expired > 0 && Date.now() >= users.expired) {
    users.premium = false
    users.expired = 0
    users.limit = env.limit
    await client.reply(users.jid,
      '🚩 Your premium package has expired.'
    )
  }
  if (!setting.online) client.sendPresenceUpdate('unavailable', m.chat)
    if (setting.online) {
      client.sendPresenceUpdate('available', m.chat)
      client.readMessages([m.key])
  }
  /* =================== USER / CHAT UPDATE =================== */
  if (m.isGroup && groupSet) groupSet.activity = Date.now()

  if (users) {
    if (!users.lid) {
      const { lid } = await client.getJid(m.sender)
      if (lid) users.lid = lid
    }
    users.name = m.pushName
    users.lastseen = Date.now()
  }

  if (chats) {
    chats.chat++
    chats.lastseen = Date.now()
  }

  /* =================== AFK =================== */
  if (m.isGroup && users && users.afk > -1) {
    await client.reply(
      m.chat,
      `You are back online after : ${Func.toTime(Date.now() - users.afk)}\n\n• Reason : ${users.afkReason || '-'}`,
      m
    )
    users.afk = -1
    users.afkReason = ''
    users.afkObj = {}
    await database.saveOnce(users)
  }

  /* =================== MEMBER TRACK =================== */
  if (m.isGroup && users && groupSet) {
    const now = Date.now()
    groupSet.member ??= {}
    groupSet.member[m.sender] ??= { lastseen: now, warning: 0 }
    groupSet.member[m.sender].lastseen = now
  }

  /* =================== BUILD PLUGIN MAP (ONCE) =================== */
  const enabledPlugins = []
  const commandMap = new Map()

  for (const [name, plugin] of Object.entries(plugins)) {
    const pname = plugin?.meta?.name
    if (pname && setting.pluginDisable?.includes(pname)) continue

    enabledPlugins.push({ name, plugin })

    if (Array.isArray(plugin?.meta?.command)) {
      for (const cmd of plugin.meta.command) {
        commandMap.set(cmd, { name, plugin })
      }
    }
  }

  /* =================== EVENT EXECUTION =================== */
  for (const { name, plugin } of enabledPlugins) {
    const meta = plugin.meta || {}
    if (meta.events !== true) continue
    if (meta.group && !m.isGroup) continue
    if (meta.private && m.isGroup) continue
    if (meta.owner && !isROwner) continue
    if (meta.admin && !isAdmin) continue
    if (meta.botadmin && !isBotAdmin) continue

    try {
      await plugin.execute(m, extra)
    } catch (e) {
      console.error('[EVENT ERROR]', name, e)
    }
  }

  /* =================== COMMAND HANDLER =================== */
  if (!command) return

  const found = commandMap.get(command)
  if (!found) return

  const { plugin: cmd, name } = found
  const metaCmd = cmd.meta || {}

  /* === ACCESS CONTROL === */
  if (metaCmd.owner && !isROwner) return m.reply(global.status.owner)
  if (metaCmd.admin && !isAdmin) return m.reply(global.status.admin)
  if (metaCmd.botadmin && !isBotAdmin) return m.reply(global.status.botAdmin)
  if (metaCmd.group && !m.isGroup) return m.reply(global.status.group)
  if (metaCmd.private && m.isGroup) return m.reply(global.status.private)
  if (metaCmd.premium && !isPrem) return m.reply(global.status.premium)

  /* === LIMIT (NO DELAY PRIVATE) === */
  if (metaCmd.limit) {
    const cost = metaCmd.limit === true ? 1 : Number(metaCmd.limit)
    if (!users || users.limit < cost) {
      return m.reply('⚠️ Your limit is not enough to use this feature.')
    }
    users.limit -= cost
  }

  /* =================== EXECUTE COMMAND =================== */
  try {
    await cmd.execute(m, extra)
  } catch (e) {
    console.log(chalk.red(e))
    await m.reply(
      `[ PLUGIN ERROR ]
• Command : ${command}
• Plugin : ${metaCmd.name || name}
• Error : ${e.message || e}`
    )
  }
}