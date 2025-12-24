'use strict'

const fs = require('fs')
const path = require('path')
const util = require('util')

module.exports = {
  meta: {
    name: 'savefile',
    command: ['sf'],
    help: ['sf <path>'],
    tag: ['owner'],
    owner: true
  },

  async execute(m, { text, prefix, Func }) {
    if (!m.quoted?.text) {
      return m.reply(`❌ *Reply kode plugin*\nContoh:\n${prefix}sf main/menu`)
    }
    if (!text) {
      return m.reply(`❌ *Path kosong*\nContoh:\n${prefix}sf main/menu`)
    }
    let input = text.trim().replace(/^\/+/, '')
    if (!input.endsWith('.js')) input += '.js'
    const fullPath = path.join(process.cwd(), 'plugins', input)
    const dir = path.dirname(fullPath)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    const status = fs.existsSync(fullPath) ? 'OVERWRITE' : 'ADD'
    try {
      new Function(m.quoted.text)
    } catch (e) {
      return m.reply(
`❌ *PLUGIN SYNTAX ERROR*

📂 *Lokasi* :
${input}

📛 *Error* :
${e.message}`
      )
    }
    fs.writeFileSync(fullPath, m.quoted.text)
    let type = 'COMMAND'
    let name = path.basename(input)
    try {
      delete require.cache[require.resolve(fullPath)]
      const plugin = require(fullPath)
      if (plugin?.meta?.events === true) type = 'EVENT'
      if (plugin?.meta?.name) name = plugin.meta.name
    } catch {}
    m.reply(
`✅ [ *PLUGIN SAVED* ]

📛 *Nama* : ${name}
📂 *Lokasi* : plugins/${input}
🧩 *Tipe* : ${type}
📝 *Status* : ${status}`
    )
  }
}