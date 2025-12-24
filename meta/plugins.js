'use strict'

const fs = require('fs')
const path = require('path')
const chokidar = require('chokidar')
const chalk = require('chalk')

let plugins = {} // ⬅ OBJECT

/* ================= UTIL ================= */
const cleanBak = file => {
  if (!file.endsWith('.bak')) return false
  try {
    fs.unlinkSync(file)
    console.log(chalk.gray('[PLUGIN] removed .bak:'), path.basename(file))
  } catch {}
  return true
}

/* ================= VALIDATOR ================= */
const isValidPlugin = (plugin, file) => {
  const errors = []

  if (!plugin || typeof plugin !== 'object')
    errors.push('module.exports bukan object')

  if (typeof plugin.execute !== 'function')
    errors.push('execute harus function')

  if (!plugin.meta || typeof plugin.meta !== 'object')
    errors.push('meta tidak ditemukan')

  if (!plugin.meta?.name)
    errors.push('meta.name wajib')

  if (
    plugin.meta.events !== true &&
    !Array.isArray(plugin.meta.command)
  )
    errors.push('meta.command harus array atau meta.events = true')

  if (errors.length) {
    console.log(chalk.red('\n[ ERROR PLUGINS INVALID ]'))
    console.log(chalk.red('- NAME     :'), path.basename(file))
    console.log(chalk.red('- LOCATION :'), file)
    console.log(chalk.red('- ALASAN   :'))
    errors.forEach(e => console.log(chalk.red('  •'), e))
    console.log(chalk.red('-----------------------------\n'))
    return false
  }

  return true
}

/* ================= LOAD ================= */
const loadPlugin = file => {
  if (cleanBak(file)) return
  if (!file.endsWith('.js')) return

  const abs = path.resolve(file)
  const name = path.basename(file, '.js')

  try {
    delete require.cache[require.resolve(abs)]
    const plugin = require(abs)

    if (!isValidPlugin(plugin, abs)) return

    plugins[name] = plugin

    console.log(
      chalk.green('[PLUGIN LOADED]'),
      chalk.white(name)
    )
  } catch (e) {
    console.log(chalk.red('[PLUGIN ERROR]'), abs)
    console.error(e)
  }
}

/* ================= REMOVE ================= */
const removePlugin = file => {
  if (cleanBak(file)) return
  if (!file.endsWith('.js')) return

  const name = path.basename(file, '.js')
  delete plugins[name]

  console.log(
    chalk.yellow('[PLUGIN REMOVED]'),
    chalk.white(name)
  )
}

/* ================= SCAN ================= */
async function scanPlugins(dir) {
  const files = await fs.promises.readdir(dir)
  const results = await Promise.all(
    files.map(async f => {
      const full = path.join(dir, f)
      const stat = await fs.promises.stat(full)
      return stat.isDirectory()
        ? scanPlugins(full)
        : full
    })
  )
  return results.flat()
}

/* ================= INIT ================= */
async function init(dir) {
  console.log(chalk.cyan.bold('\nINSTALLING PLUGINS SYSTEM....\n'))

  const files = await scanPlugins(dir)
  files.forEach(loadPlugin)

  chokidar
    .watch(dir, { ignoreInitial: true })
    .on('add', loadPlugin)
    .on('change', loadPlugin)
    .on('unlink', removePlugin)

  return plugins
}

module.exports = {
  init,
  getPlugins: () => plugins
}