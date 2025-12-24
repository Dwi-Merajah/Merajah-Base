'use strict'

module.exports = {
  meta: {
    name: 'disableplugin',
    command: ['disable', 'pluginoff'],
    help: ['disable'],
    use: '<command>',
    tag: ['owner'],
    owner: true
  },

  async execute(m, { text, plugins, setting }) {
    if (!text) {
      return m.reply(
        `❌ *Command plugin kosong*\nContoh:\n.disable afk`
      )
    }

    const cmdName = text.trim().toLowerCase()

    const plugin = Object.values(plugins).find(p =>
      Array.isArray(p.meta?.command) &&
      p.meta.command.includes(cmdName)
    )

    if (!plugin) {
      return m.reply(`❌ Plugin dengan command *${cmdName}* tidak ditemukan`)
    }

    const name = plugin.meta.name

    if (!setting.pluginDisable) {
      setting.pluginDisable = []
    }

    if (setting.pluginDisable.includes(name)) {
      return m.reply(`⚠️ Plugin *${name}* sudah nonaktif`)
    }

    setting.pluginDisable.push(name)

    m.reply(
`🚫 *PLUGIN DINONAKTIFKAN*

• Plugin : ${name}
• Command : ${cmdName}`
    )
  }
}