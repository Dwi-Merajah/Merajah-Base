'use strict'

const { exec } = require('child_process')
const syntax = require('syntax-error')

module.exports = {
  meta: {
    name: 'eval',
    events: true,
    owner: true
  },

  async execute(m, ctx) {
    if (!m.text) return

    const { Func, sock } = ctx

    let body, text
    const x = m.text.trim().split('\n')
    let y = ''

    body = x[0]?.split(' ')[0]
    if (!['=>', '>', '$'].includes(body)) return

    y += x[0]?.split(' ').slice(1).join(' ')
    y += x.slice(1).join('\n')
    text = y.trim()
    if (!text) return

    /* =====================
       RETURN EVAL (=>)
    ====================== */
    if (body === '=>') {
      try {
        const result = await eval(`(async () => {
          return ${text}
        })()`)

        await sock.reply(
          m.chat,
          Func.jsonFormat(result),
          m
        )
      } catch (e) {
        const err = syntax(text) || e
        await sock.reply(
          m.chat,
          Func.jsonFormat(err),
          m
        )
      }
    }

    /* =====================
       ASYNC EXEC EVAL (>)
    ====================== */
    else if (body === '>') {
      try {
        const result = await eval(`(async () => {
          ${text}
        })()`)

        await sock.reply(
          m.chat,
          Func.jsonFormat(result),
          m
        )
      } catch (e) {
        const err = syntax(text) || e
        await sock.reply(
          m.chat,
          Func.jsonFormat(err),
          m
        )
      }
    }

    /* =====================
       SHELL EXEC ($)
    ====================== */
    else if (body === '$') {
      exec(text.trim(), (err, stdout, stderr) => {
        if (err) return m.reply(Func.jsonFormat(err))
        if (stderr) return m.reply(stderr.toString())
        if (stdout) return m.reply(stdout.toString())
      })
    }
  }
}