'use strict'

const fs = require('fs')
const path = require('path')
const axios = require('axios')
const mime = require('mime-types')
const moment = require('moment-timezone')
const chokidar = require('chokidar')
const util = require('util')

class Function {
  /* =========================
   * BASIC UTIL
   * ========================= */

  greeting() {
    let time = moment.tz('Asia/Makassar').format('HH')
    let res = `Don't forget to sleep`
    if (time >= 3) res = `Good Evening`
    if (time > 6) res = `Good Morning`
    if (time >= 11) res = `Good Afternoon`
    if (time >= 18) res = `Good Night`
    return res
  }

  uuid() {
    return Math.random().toString(36).substr(2, 9)
  }

  toTime(ms) {
    let h = Math.floor(ms / 3600000)
    let m = Math.floor(ms / 60000) % 60
    let s = Math.floor(ms / 1000) % 60
    return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
  }

  example(isPrefix, command, args) {
    return `📮 Example : ${isPrefix + command} ${args}`
  }

toTime = function (ms = 0) {
  if (typeof ms !== 'number' || isNaN(ms)) return '00:00:00'

  let seconds = Math.floor(ms / 1000)
  if (seconds < 0) seconds = 0

  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60

  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':')
}

  jsonRandom(file) {
    const json = JSON.parse(fs.readFileSync(file))
    return json[Math.floor(Math.random() * json.length)]
  }
  delay = async (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  jsonFormat(obj) {
    try {
      let print = (obj && (obj.constructor.name == 'Object' || obj.constructor.name == 'Array')) ? require('util').format(JSON.stringify(obj, null, 2)) : require('util').format(obj)
      return print
    } catch {
      return require('util').format(obj)
    }
  }
  
  fetchJson = async (url, options = {}) => {
    try {
      const res = await axios({
        method: 'GET',
        url,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        },
        ...options
      })
      return res.data
    } catch (e) {
      return e
    }
  }

  fetchBuffer = async (url, options = {}) => {
    try {
      const res = await axios({
        method: 'GET',
        url,
        responseType: 'arraybuffer',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        },
        ...options
      })
      return res.data
    } catch (e) {
      return e
    }
  }
  
  Styles(text, style = 1) {
    var xStr = 'abcdefghijklmnopqrstuvwxyz1234567890'.split('')
    var yStr = Object.freeze({
      1: 'ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘqʀꜱᴛᴜᴠᴡxʏᴢ1234567890'
    })
    var replacer = []
    xStr.map((v, i) => replacer.push({
      original: v,
      convert: yStr[style].split('')[i]
    }))
    var str = text.toLowerCase().split('')
    var output = []
    str.map(v => {
      const find = replacer.find(x => x.original == v)
      find ? output.push(find.convert) : output.push(v)
    })
    return output.join('')
  }
}

module.exports = new Function()