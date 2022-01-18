import * as os from 'os'
import Loaders from './loaders.js'
import debug from 'debug'

/**
 * Build a list of file names to check in each candidate directory for this app.
 *
 * @param {string} appName The application name to use to build file names.
 * @returns {string[]} The default set of filenames for this app.
 */
export function fileNames(appName) {
  return [
    `.${appName}rc`,
    `.${appName}rc.json`,
    `.${appName}rc.yml`,
    `.${appName}rc.yaml`,
    `.${appName}rc.js`,
    `.${appName}rc.mjs`,
    `${appName}.config.yml`,
    `${appName}.config.yaml`,
    `${appName}.config.json`,
    `${appName}.config.js`,
    `${appName}.config.mjs`,
    'sum.config.js',
    'sum.config.mjs',
    'package.json',
  ]
}

/**
 * The default configuration for sumconfig.
 *
 * @param {string} [appName] Name of the app.
 * @returns {import('./types').Options} The default options for this appName.
 */
export function defaultMeta(appName) {
  return {
    errorOnEmpty: false,
    startDir: process.cwd(),
    stopDirs: [os.homedir()],
    stopPeers: ['.git', '.hg'],
    fileNames: appName ? fileNames(appName) : [],
    loaders: Loaders.map,
    log: debug('sumconfig'),
  }
}
