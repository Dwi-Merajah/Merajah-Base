'use strict'

module.exports = {
  meta: {
    name: 'enableplugin',
    command: ['enable', 'pluginon'],
    help: ['enable'],
    use: '<command>',
    tag: ['owner'],
    owner: true
  },

  async execute(m, { text, plugins, setting }) {
    if (!text) {
      return m.reply(
        `❌ *Command plugin kosong*\nContoh:\n.enable afk`
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

    if (!setting.pluginDisable || !setting.pluginDisable.includes(name)) {
      return m.reply(`⚠️ Plugin *${name}* tidak sedang dinonaktifkan`)
    }

    setting.pluginDisable = setting.pluginDisable.filter(v => v !== name)

    m.reply(
`✅ *PLUGIN DIAKTIFKAN*

• Plugin : ${name}
• Command : ${cmdName}`
    )
  }
}