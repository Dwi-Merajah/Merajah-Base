'use strict'

const fs = require('fs')
const path = require('path')

module.exports = {
  meta: {
    name: 'getfile',
    command: ['gf'],
    help: ['gf <path>'],
    tag: ['owner'],
    owner: true
  },

  async execute(m, { text, prefix }) {
    if (!text) {
      return m.reply(`❌ *Path kosong*\nContoh:\n${prefix}gf main/menu`)
    }
    let input = text.trim().replace(/^\/+/, '')
    if (!input.endsWith('.js')) input += '.js'
    const fullPath = path.join(process.cwd(), 'plugins', input)
    if (!fs.existsSync(fullPath)) {
      return m.reply(`❌ *Plugin tidak ditemukan*\n📂 ${input}`)
    }
    const code = fs.readFileSync(fullPath, 'utf-8')
    await m.reply(code)
  }
}