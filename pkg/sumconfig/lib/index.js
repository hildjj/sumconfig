import * as fs from 'fs/promises'
import * as os from 'os'
import * as path from 'path'
import * as util from 'util'
import Combiners from './combiners.js'
import envPaths from 'env-paths'
import parseJson from 'parse-json'
import yaml from 'yaml'

/**
 * @callback Loader
 * @param {string} appName The application name.
 * @param {string} fileName The full path of the file to load.
 * @param {Options} opts Options for loading.
 * @returns {Promise<object>} The loaded config, or {} if there was an
 *   ignorable error.
 */

/**
 * Options for gathering options.
 *
 * @typedef {object} Options
 * @property {boolean} [errorOnEmpty = false] Throw an error if a config file
 *   exists, but it is empty.
 * @property {Object.<string, Loader>} [loaders] Map from file name or
 *   extension (including dot) to a Loader function.  Defaults to loaders for
 *   package.json, .json, .yaml, .yml, .js (modules only!), and .mjs.  Use ""
 *   for files with no extension (defaults to the YAML loader, which handles
 *   JSON slightly slower than the JSON loader).
 * @property {string} [startDir=process.cwd()] Where to start searching from.
 * @property {string} [stopDir=os.homedir()] If we get to this directory,
 * stop.
 * @property {string[]} [dirs] What directories to search.  If not specified,
 *   will start at startDir and go to stopDir, going up a directory each time.
 *   Directories closer to the current directory take precedence.
 * @property {string[]} [fileNames] What file names to check.  If not
 *   specified, will use a list based on the appName.
 * @property {boolean} [ignoreGit] Don't stop when we get to the top of a git
 *   repo.
 * @property {import('./combiners').Combiner} [combine] Specify how to
 *   combine any two values. Defaults to the opinionated combiner in
 *   combiners.js.
 */

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
    `${appName}.config.js`,
    `${appName}.config.mjs`,
    'package.json',
  ]
}

/**
 * @private
 * @param {string} f The full path of the file to read from.  MUST be in utf8.
 * @param {Options} opts Options.
 * @returns {Promise<string>} The file contents.
 */
async function readFile(f, opts) {
  let src = null
  try {
    src = await fs.readFile(f, 'utf8')
  } catch (e) {
    if (e?.code !== 'ENOENT') {
      throw e
    }
    return null
  }
  if (src.length === 0) {
    if (opts?.errorOnEmpty) {
      throw new Error(`Empty file: "${f}"`)
    }
    return null
  }
  return src
}

/**
 * Load a Yaml file.
 *
 * @private
 * @param {string} appName The application name.
 * @param {string} fileName The full path of the file to load.
 * @param {Options} opts Options for loading.
 * @returns {Promise<object>} The loaded config, or {} if there was an
 *   ignorable error.
 */
async function loadYaml(appName, fileName, opts) {
  const src = await readFile(fileName, opts)
  if (!src) {
    return {}
  }
  try {
    return yaml.parse(src, {
      prettyErrors: true,
    })
  } catch (er) {
    er.message = er.message.replace(
      /, column (?<col>\d+):$/m,
      `, column $<col> in ${fileName}`
    )
    throw er
  }
}

/**
 * Load a JSON file.
 *
 * @private
 * @param {string} appName The application name.
 * @param {string} fileName The full path of the file to load.
 * @param {Options} opts Options for loading.
 * @returns {Promise<object>} The loaded config, or {} if there was an
 *   ignorable error.
 */
async function loadJson(appName, fileName, opts) {
  const src = await readFile(fileName, opts)
  if (!src) {
    return {}
  }
  return parseJson(src, fileName)
}

/**
 * Load a package.json file, and extract the correct key from it if it exists.
 *
 * @private
 * @param {string} appName The application name.
 * @param {string} fileName The full path of the file to load.
 * @param {Options} opts Options for loading.
 * @returns {Promise<object>} The loaded config, or {} if there was an
 *   ignorable error.
 */
async function loadPackageJson(appName, fileName, opts) {
  const pkg = await loadJson(appName, fileName, opts)

  const res = pkg[appName]
  if (res === undefined) {
    return {}
  }
  if (!res || (typeof res !== 'object') || Array.isArray(res)) {
    throw new TypeError(`Invalid type in ${fileName} key ${appName}, expected object`)
  }
  return res
}

/**
 * Load a js module.  Must not be cjs, so if you're loading from a config
 * directory without a package.json, use `.mjs`.
 *
 * @private
 * @param {string} appName The application name.
 * @param {string} fileName The full path of the file to load.
 * @param {Options} opts Options for loading.
 * @returns {Promise<object>} The loaded config, or {} if there was an
 *   ignorable error.
 */
async function loadJs(appName, fileName, opts) {
  let stat = null
  try {
    stat = await fs.stat(fileName)
  } catch {
    return {}
  }
  if (!stat.isFile()) {
    throw new Error(`${fileName} is not a file`)
  }
  if (opts?.errorOnEmpty && (stat.size === 0)) {
    throw new Error(`Empty file: "${fileName}"`)
  }

  // eslint-disable-next-line node/no-unsupported-features/es-syntax
  const mod = await import(fileName)
  if (!mod.default) {
    const modType = typeof mod.default
    if ((modType !== 'object') && (modType !== 'function')) {
      throw new TypeError(`Invalid module in ${fileName}.  Must have object or function as default export`)
    }
  }
  return mod.default
}

/**
 * The default loaders.
 *
 * @type {Object.<string, Loader>}
 */
export const loaders = {
  '': loadYaml,
  'package.json': loadPackageJson,
  '.yaml': loadYaml,
  '.yml': loadYaml,
  '.json': loadJson,
  '.js': loadJs,
  '.mjs': loadJs,
}

/**
 * Pick the correct loader, and call it.
 *
 * @private
 * @param {string} appName The application name.
 * @param {string} fileName The full path of the file to load.
 * @param {Options} opts Options for loading.
 * @returns {Promise<object>} The loaded config, or {} if there was an
 *   ignorable error.
 * @throws {Error} No known loader for this file type.
 */
function loadFile(appName, fileName, opts) {
  const p = path.parse(fileName)
  const ldrs = opts?.loaders || loaders
  const loader = ldrs[p.base] ?? ldrs[p.ext]
  if (!loader) {
    throw new Error(`Invalid file, no loader "${fileName}"`)
  }
  return loader(appName, fileName, opts)
}

/**
 * Walk the directory path, starting at opts.startDir and ending at
 * opts.stopDir or the root of startDir's file system.
 *
 * @param {string} appName The application name.
 * @param {Options} opts Options.
 * @returns {Promise<string[]>} The directories.
 */
export async function allDirs(appName, opts) {
  const p = []

  let dir = opts?.startDir ?? process.cwd()
  const {root} = path.parse(dir)
  const stopDir = opts?.stopDir ?? os.homedir()

  while ((dir !== root) && (dir !== stopDir)) {
    if (!opts?.ignoreGit) {
      try {
        // Stop when we get to the top of a project.
        const stat = await fs.stat(path.join(dir, '.git'))
        if (stat.isDirectory()) {
          break
        }
      } catch {
        // Ignored
      }
    }
    p.push(dir)
    dir = path.dirname(dir)
  }
  p.push(dir)

  // XDG_CONFIG_HOME, or something OS-specific.
  const paths = envPaths(appName)
  try {
    const stat = await fs.stat(paths.config)
    if (stat.isDirectory()) {
      p.push(paths.config)
    }
  } catch {
    // Ignored
  }

  return p
}

/**
 * Gather configurations together from all of the places we can find.
 *
 * @param {string} appName The application name.  All of the characters in the
 *   name should be safe for use in a filename.
 * @param {Options} opts Options.
 * @returns {Promise<object>} The combined configurations.
 * @throws {Error} Invalid appName.
 */
export async function sumconfig(appName, opts = {}) {
  // These are known-bad
  if (appName.match(/\p{Control}|\p{Unassigned}|[.!@$%^&*()[\]|:;<>?/\\]/u)) {
    throw new Error(`Invalid appName ${util.inspect(appName)}`)
  }
  // I suggest Letter/Digit/Hyphen/Underscore
  if (!appName.match(/^(?:\p{Letter}|\p{Number}|[_-])+$/u)) {
    process.emitWarning(`The application name ${util.inspect(appName)} may cause issues`, {
      code: 'sumconfig.suspectName',
    })
  }
  const dirs = opts?.dirs ?? await allDirs(appName, opts)
  const possible = opts?.fileNames ?? fileNames(appName)
  const files = dirs.flatMap(d => possible.map(f => path.join(d, f)))
  const all = await Promise.all(files.map(f => loadFile(appName, f, opts)))
  const combine = opts?.combine ?? Combiners.combine
  return all.reduceRight(async(t, v) => combine(await t, v), {})
}

export default sumconfig
