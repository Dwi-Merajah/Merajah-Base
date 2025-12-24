'use strict'

module.exports = {
  meta: {
    name: 'menu',
    command: ['menu'],
    tag: ['misc']
  },

  async execute(m, { client, prefix, plugins }) {
    const grouped = Object.values(plugins)
      .filter(p =>
        Array.isArray(p?.meta?.help) &&
        Array.isArray(p?.meta?.tag) &&
        p.meta.tag[0]
      )
      .reduce((acc, p) => {
        const tag = p.meta.tag[0]
        acc[tag] ??= []

        const use = p.meta.use ? ` ${p.meta.use}` : ''

        acc[tag].push(
          ...p.meta.help.map(h => `${prefix}${h}${use}`)
        )
        return acc
      }, {})

    const totalFeature = Object.values(grouped)
      .reduce((a, b) => a + b.length, 0)

    if (!totalFeature) return m.reply('Menu kosong.')

    let text =
`╭─「 📜 *MENU BOT* 」
│ • Base : ${require(process.cwd() + '/package.json').name}
│ • Status : [ Beta ]
│ • Version : ${require(process.cwd() + '/package.json').version}
│ • Author : @Dwi-Merajah
│ • Total fitur : [ ${totalFeature} ]
╰───────────────╯`

    Object.keys(grouped).sort().forEach(tag => {
      text += `\n\n📂 *${tag.toUpperCase()}*\n`
      text += grouped[tag].map(cmd => `• ${cmd}`).join('\n')
    })

    await client.sendMessage(m.chat, {
      text: Func.Styles(text)
    })
  }
}