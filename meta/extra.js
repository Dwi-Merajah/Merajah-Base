'use strict'
const { toAudio, toPTT, toVideo } = require('./converter')
const FileType = require('file-type')
const fs = require('fs')
const path = require('path')
const fetch = require("node-fetch")
const {
   jidDecode
} = require("@merajah/baileys");

module.exports = function extra(sock) {

  /* ================= UTIL ================= */
   sock.decodeJid = (jid) => {
      if (!jid) return jid;
      if (/:\d+@/gi.test(jid)) {
         const decode = jidDecode(jid) || {};
         return (
            (decode.user && decode.server && decode.user + "@" + decode.server) ||
            jid
         );
      } else return jid;
   };
   
  if (sock.user?.id) sock.user.jid = sock.decodeJid(sock.user.id)

  sock.store = {
    chats: {},
    contacts: {},
    groups: {},
    lidMap: {}
  }

  function mapLid(jid, lid) {
    if (!jid || !lid) return
    sock.store.lidMap[jid] = lid
    sock.store.lidMap[lid] = jid
  }

  /* ================= PARSE MENTION ================= */

  sock.parseMention = (text = '') => {
    if (typeof text !== 'string') return []
    return (text.match(/@([0-9]{5,20})/g) || [])
      .map(v => v.replace('@', '') + '@s.whatsapp.net')
  }

  /* ================= CONTACTS ================= */

  function updateContacts(contacts) {
    if (!contacts) return

    for (const c of contacts) {
      const jid = sock.decodeJid(c.id)
      if (!jid) continue

      sock.store.contacts[jid] = {
        ...(sock.store.contacts[jid] || {}),
        ...c,
        jid,
        name: c.notify || c.name || ''
      }

      if (c.lid) mapLid(jid, c.lid)
    }
  }

  sock.ev.on('contacts.upsert', updateContacts)

  /* ================= GROUP METADATA CACHE ================= */

  async function getGroupMetadataCached(jid) {
    jid = sock.decodeJid(jid)
    if (!jid) return null

    if (sock.store.groups[jid]) return sock.store.groups[jid]

    const meta = await sock.groupMetadata(jid).catch(() => null)
    if (!meta) return null

    sock.store.groups[jid] = meta

    for (const p of meta.participants || []) {
      if (p.jid && p.id) mapLid(p.jid, p.id)
    }

    return meta
  }

  sock.groupMetadataCache = getGroupMetadataCached

  /* ================= CHATS SET / UPSERT ================= */

  function upsertChat(id, data = {}) {
    if (!id) return
    sock.store.chats[id] = {
      ...(sock.store.chats[id] || { jid: id }),
      ...data,
      jid: id,
      isChats: true
    }
  }

  sock.ev.on('chats.set', async ({ chats }) => {
    for (const chat of chats) {
      const jid = sock.decodeJid(chat.id)
      if (!jid) continue

      upsertChat(jid, chat)

      if (jid.endsWith('@g.us')) {
        const meta = await getGroupMetadataCached(jid)
        if (meta) {
          sock.store.chats[jid].subject = chat.name || meta.subject
          sock.store.chats[jid].metadata = meta
        }
      }
    }
  })

  sock.ev.on('chats.upsert', async chats => {
    for (const chat of chats) {
      const jid = sock.decodeJid(chat.id)
      if (!jid) continue

      upsertChat(jid, chat)

      if (jid.endsWith('@g.us')) {
        const meta = await getGroupMetadataCached(jid)
        if (meta) {
          sock.store.chats[jid].subject = chat.name || meta.subject
          sock.store.chats[jid].metadata = meta
        }
      }
    }
  })

  /* ================= GROUP EVENTS ================= */

  sock.ev.on('groups.update', async updates => {
    for (const up of updates) {
      const jid = sock.decodeJid(up.id)
      if (!jid || !jid.endsWith('@g.us')) continue

      const meta = await getGroupMetadataCached(jid)
      if (!meta) continue

      upsertChat(jid, {
        subject: meta.subject,
        metadata: meta
      })
    }
  })

  sock.ev.on('group-participants.update', async ({ id }) => {
    const jid = sock.decodeJid(id)
    if (!jid) return

    const meta = await getGroupMetadataCached(jid)
    if (!meta) return

    upsertChat(jid, {
      subject: meta.subject,
      metadata: meta
    })
  })

  /* ================= PRESENCE ================= */

  sock.ev.on('presence.update', async ({ id, presences }) => {
    const sender = Object.keys(presences || {})[0] || id
    const jid = sock.decodeJid(sender)
    if (!jid) return

    upsertChat(jid, {
      presence: presences?.[sender]?.lastKnownPresence || 'available'
    })

    if (id?.endsWith('@g.us')) {
      const meta = await getGroupMetadataCached(id)
      if (meta) {
        upsertChat(id, {
          subject: meta.subject,
          metadata: meta
        })
      }
    }
  })

  /* ================= MESSAGE UPSERT (AUTO CACHE) ================= */

  sock.ev.on('messages.upsert', async ({ messages }) => {
    for (const m of messages || []) {
      const chat = sock.decodeJid(m.key.remoteJid)
      const sender = sock.decodeJid(m.key.participant || m.key.remoteJid)
      if (!chat) continue

      upsertChat(chat)
      if (sender) upsertChat(sender)

      if (chat.endsWith('@g.us')) {
        const meta = await getGroupMetadataCached(chat)
        if (meta) {
          sock.store.chats[chat].subject = meta.subject
          sock.store.chats[chat].metadata = meta
        }
      }
    }
  })

  /* ================= LID RESOLVER ================= */

  sock.getLid = (id) => {
   if (!id) return null
   if (id.endsWith('@lid')) return id
   if (id.endsWith('@s.whatsapp.net')) {
    return sock.store?.lidMap?.[id] || null
  }

  return null
  }
  
  sock.getJid = (id) => {
   if (!id) return null
   if (id.endsWith('@s.whatsapp.net')) return id
   if (id.endsWith('@lid')) {
    return sock.store?.lidMap?.[id] || null
   }
   return null
  }
  sock.getFile = async (PATH, returnAsFilename) => {
        let res, filename
        const data = Buffer.isBuffer(PATH) ? PATH : /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split`,`[1], 'base64') : /^https?:\/\//.test(PATH) ? await (res = await fetch(PATH)).buffer() : fs.existsSync(PATH) ? (filename = PATH, fs.readFileSync(PATH)) : typeof PATH === 'string' ? PATH : Buffer.alloc(0)
        if (!Buffer.isBuffer(data)) throw new TypeError('Result is not a buffer')
        const type = await FileType.fromBuffer(data) || {
            mime: 'application/octet-stream',
            ext: '.bin'
        }
        if (data && returnAsFilename && !filename) (filename = path.join(process.cwd(), '/temp/' + new Date * 1 + '.' + type.ext), await fs.promises.writeFile(filename, data))
        return {
            res,
            filename,
            ...type,
            data,
            deleteFile() {
                return filename && fs.promises.unlink(filename)
            }
       }
  }
sock.sendFile = async (jid, file, filename, caption = '', quoted, options = {}) => {
   try {
      let data

      if (Buffer.isBuffer(file)) {
         data = file
      } else if (typeof file === 'string') {
         if (/^https?:\/\//.test(file)) {
            data = await Func.fetchBuffer(file)
         } else if (/^data:.*?;base64,/i.test(file)) {
            data = Buffer.from(file.split(',')[1], 'base64')
         } else if (fs.existsSync(file)) {
            data = fs.readFileSync(file)
            if (!filename) filename = path.basename(file)
         } else {
            throw new Error('Input file tidak valid')
         }
      } else {
         throw new Error('Tipe file tidak didukung')
      }

      const type = (await FileType.fromBuffer(data)) || {
         mime: 'application/octet-stream',
         ext: 'bin'
      }

      let { mime, ext } = type
      let mtype

      if (/audio/i.test(mime)) {
       if (options.ptt) {
        const converted = await toPTT(data, ext)
          if (!converted || !converted.data) {
           throw new Error('Gagal mengonversi ke PTT')
          }
          data = converted.data
          mime = 'audio/mpeg'
          mtype = 'audio'
      } else {
         const converted = await toAudio(data, ext)
         if (!converted || !converted.data) {
          throw new Error('Gagal mengonversi ke audio')
         }

        data = converted.data
        mime = 'audio/mpeg'
        mtype = 'audio'
       }
      } else if (/video/i.test(mime)) {
         const converted = await toVideo(data, ext)
         if (!converted || !converted.data) throw new Error('Gagal mengonversi ke MP4')
         data = converted.data
         mime = 'video/mp4'
         mtype = 'video'
         if (options.gif) options.gifPlayback = true
      } else if (/image/i.test(mime)) {
         mtype = 'image'
      } else {
         mtype = 'document'
      }

      if (!filename) filename = `file.${ext || 'bin'}`

      const msg = {
         caption,
         mimetype: mime,
         fileName: filename,
         ptt: !!options.ptt,
         ...options
      }

      if (mtype === 'audio') msg.audio = data
      else if (mtype === 'video') msg.video = data
      else if (mtype === 'image') msg.image = data
      else msg.document = data

      const res = await sock.sendMessage(jid, msg, { quoted, ...options })
      return res
   } catch (e) {
      console.error(e)
   }
}
sock.reply = async (jid, text, quoted, options = {}) => {
      await sock.sendPresenceUpdate("composing", jid);
      const messageContent = {
         text,
         mentions: sock.parseMention(text),
         ...options
      };
      return await sock.sendMessage(jid, messageContent, {
         quoted
      });
};

  return sock
}