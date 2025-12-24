'use strict'

module.exports = {
  meta: {
    name: 'get',
    command: ['get'],
    help: ['get'],
    use: '<url>',
    tag: ['misc'],
    limit: true
  },

  async execute(m, { client, args }) {
    try {
      /* ================= VALIDASI URL ================= */
      if (!args[0] || !/^https?:\/\//i.test(args[0])) {
        return m.reply(
          '📮 *URL tidak valid*\nContoh:\n.get https://example.com'
        )
      }

      const url = args[0]
      const { origin } = new URL(url)

      /* ================= CEK HEADER ================= */
      const res = await fetch(url, {
        headers: { referer: origin }
      })

      const size = Number(res.headers.get('content-length') || 0)
      if (size && size > 100 * 1024 * 1024) {
        throw `File terlalu besar (${(size / 1024 / 1024).toFixed(2)} MB)`
      }

      const type = res.headers.get('content-type') || ''

      /* ================= AMBIL FILE ================= */
      const file = await client.getFile(url, true)
      const filename =
        file.filename?.split('/').pop() || `file.${file.ext}`

      /* ================= TEXT / JSON ================= */
      if (/text|json/i.test(type)) {
        let text = file.data.toString()

        try {
          text = JSON.stringify(JSON.parse(text), null, 2)
        } catch {}

        return m.reply(text.slice(0, 65536))
      }

      /* ================= SEMUA FILE ================= */
      await client.sendFile(
        m.chat,
        file.data,
        filename,
        url,
        m
      )

      await file.deleteFile?.()
    } catch (e) {
      return m.reply(
        typeof e === 'string'
          ? `❌ ${e}`
          : `❌ Error: ${e.message || e}`
      )
    }
  }
}