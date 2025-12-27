'use strict'
require('events').EventEmitter.defaultMaxListeners = 0
/* ===================== IMPORT ===================== */
const Baileys = require('@merajah/baileys')
const path = require('path')
const fs = require('fs')

const handler = require('./handler')
const LocalDB = require('./meta/database/localdb')
const Func = require('./meta/function')
const chalk = require("chalk")
require("./config")
  
;(async () => {
  const database = new LocalDB('database')

  const client = new Baileys({
    number: '6289504850078',
    session: 'sessions',
    browser: ['Linux', 'Chrome', '20.0.00'],
    online: true,
    plugins: 'plugins'
  })

  client.once('connect', async ctx => {    
    global.db = {
      users: [],
      chats: [],
      groups: [],
      statistic: {},
      sticker: {},
      setting: {},
      ...(await database.fetch() || {})
    }

    await database.save(global.db)

    if (!fs.existsSync('./temp')) fs.mkdirSync('./temp')

    /* ===== AUTO CLEAN TEMP ===== */
    setInterval(() => {
      try {
        fs.readdirSync('./temp')
          .filter(v => !v.endsWith('.file'))
          .forEach(v => fs.unlinkSync(`./temp/${v}`))
      } catch {}
    }, 10 * 60 * 1000)

    /* ===== AUTO SAVE DB ===== */
    setInterval(async () => {
      if (global.db) await database.save(global.db)
    }, 5 * 60 * 1000)
  })

  /* ============ MESSAGE HANDLER ============ */
  client.register('message', async ctx => {
    try {
    await handler({
        ...ctx,
        database
      })
    } catch (e) {
      console.error('[HANDLER ERROR]', e)
    }
  })

  /* ============ GROUP PROMOTE ============ */
  client.register('group.promote', async ctx => {
    const { sock, jid, participants } = ctx
    const user = participants?.[0]
    if (!user) return

    await sock.sendMessage(jid, {
      text: `⭐ @${user.split('@')[0]} sekarang *admin*`,
      mentions: [user]
    })
  })

  /* ============ GROUP DEMOTE ============ */
  client.register('group.demote', async ctx => {
    const { sock, jid, participants } = ctx
    const user = participants?.[0]
    if (!user) return

    await sock.sendMessage(jid, {
      text: `⚠️ @${user.split('@')[0]} *bukan admin lagi*`,
      mentions: [user]
    })
  })

  /* ============ GROUP WELCOME ============ */
  client.register('group.add', async ctx => {
    const { sock, jid, participants } = ctx
    const member = participants?.[0]
    if (!member || !global.db?.groups) return

    const groupSet = global.db.groups.find(v => v.jid === jid)
    if (!groupSet || groupSet.welcome !== true) return

    const subject = sock.store?.groups?.[jid]?.subject || 'Group'
    const defText = 'Selamat datang +tag di grup +grup'

    let thumb
    try {
      const url = await sock.profilePictureUrl(member, 'image')
      thumb = await Func.fetchBuffer(url)
    } catch {
      thumb = await Func.fetchBuffer('./media/image/default.jpg')
    }

    const text = (groupSet.text_welcome || defText)
      .replace(/\+tag/g, `@${member.split('@')[0]}`)
      .replace(/\+grup/g, subject)

    await sock.sendMessage(jid, {
      text,
      mentions: [member],
      contextInfo: {
        externalAdReply: {
          title: subject,
          body: 'Welcome',
          thumbnail: thumb,
          mediaType: 1,
          renderLargerThumbnail: true,
          sourceUrl: global.db.setting?.link || ''
        }
      }
    })
  })

  /* ============ GROUP LEFT ============ */
  client.register('group.remove', async ctx => {
    const { sock, jid, participants } = ctx
    const member = participants?.[0]
    if (!member || !global.db?.groups) return

    const groupSet = global.db.groups.find(v => v.jid === jid)
    if (!groupSet || groupSet.left !== true) return

    const subject = sock.store?.groups?.[jid]?.subject || 'Group'
    const defText = 'Good bye +tag dari grup +grup'

    let thumb
    try {
      const url = await sock.profilePictureUrl(member, 'image')
      thumb = await Func.fetchBuffer(url)
    } catch {
      thumb = await Func.fetchBuffer('./media/image/default.jpg')
    }

    const text = (groupSet.text_left || defText)
      .replace(/\+tag/g, `@${member.split('@')[0]}`)
      .replace(/\+grup/g, subject)

    await sock.sendMessage(jid, {
      text,
      mentions: [member],
      contextInfo: {
        externalAdReply: {
          title: subject,
          body: 'Good bye',
          thumbnail: thumb,
          mediaType: 1,
          renderLargerThumbnail: true,
          sourceUrl: global.db.setting?.link || ''
        }
      }
    })
  })
  
  /* ============ MESSAGE DELETE (ANTI DELETE) ============ */
  client.register('message.delete', async ctx => {
   const { sock, jid, type, text, buffer } = ctx
   try {
    if (type === 'text') {
      if (!text) return
      await sock.sendMessage(jid, { text })
    }

    if (type === 'image' && buffer) {
      await sock.sendMessage(jid, {
        image: buffer,
        caption: text ? text : ""
      })
    }

    if (type === 'video' && buffer) {
      await sock.sendMessage(jid, {
        video: buffer,
        caption: text ? text : ""
      })
    }
   } catch (e) {
    console.error('[DELETE ERROR]', e)
   }
  })
  /* ============ ERROR HANDLE ============ */
  client.register('error', err => {
    console.error('[BOT ERROR]', err)
  })
})()
