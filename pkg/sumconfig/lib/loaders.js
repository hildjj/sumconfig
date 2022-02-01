import * as fs from 'fs/promises'
import * as path from 'path'
import {Loaded} from './loaded.js'
import parseJson from 'parse-json'
import yaml from 'yaml'

export class Loaders {
  // Cache non-mjs file contents.
  // 1) .mjs files will get cached by the loader
  // 2) package.json and sum.config.[m]js files return different results
  //    based on the appName, which is the whole reason for doing caching.
  /**
   * @type {{[fileName: string]: import('./loaded').OptInitial}}
   */
  static cache = {}

  /**
   * Clear the loader cache.
   */
  static clearCache() {
    Loaders.cache = {}
  }

  /**
   * @private
   * @param {string} f The full path of the file to read from.  MUST be in utf8.
   * @param {import('./loaded').Options} opts Options.
   * @returns {Promise<string>} The file contents.
   */
  static async readFile(f, opts) {
    // Throws various errors, but ENOENT isn't special, because we shouldn't
    // be trying to read non-existant files.
    const src = await fs.readFile(f, 'utf8')
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
   * @param {import('./loaded').Options} opts Options for loading.
   * @returns {Promise<object>} The loaded config, or {} if there was an
   *   ignorable error.
   */
  static async loadYaml(appName, fileName, opts) {
    let res = Loaders.cache[fileName]
    if (res) {
      return res
    }
    const src = await Loaders.readFile(fileName, opts)
    if (!src) {
      return {}
    }
    try {
      res = yaml.parse(src, {
        prettyErrors: true,
      })
      // This should be safe enough.
      // eslint-disable-next-line require-atomic-updates
      Loaders.cache[fileName] = res
      return res
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
   * @param {import('./loaded').Options} opts Options for loading.
   * @returns {Promise<object>} The loaded config, or {} if there was an
   *   ignorable error.
   */
  static async loadJson(appName, fileName, opts) {
    let res = Loaders.cache[fileName]
    if (res) {
      return res
    }
    const src = await Loaders.readFile(fileName, opts)
    if (!src) {
      return {}
    }
    res = parseJson(src, fileName)
    // This should be safe enough.
    // eslint-disable-next-line require-atomic-updates
    Loaders.cache[fileName] = res
    return res
  }

  /**
   * Load a package.json file, and extract the correct key from it if it exists.
   *
   * @private
   * @param {string} appName The application name.
   * @param {string} fileName The full path of the file to load.
   * @param {import('./loaded').Options} opts Options for loading.
   * @returns {Promise<object>} The loaded config, or {} if there was an
   *   ignorable error.
   */
  static async loadPackageJson(appName, fileName, opts) {
    const pkg = await Loaders.loadJson(appName, fileName, opts)

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
   * @param {import('./loaded').Options} opts Options for loading.
   * @returns {Promise<import('./loaded').OptInitial>} The loaded config, or
   *   {} if there was an ignorable error.
   */
  static async loadJs(appName, fileName, opts) {
    if (opts?.errorOnEmpty) {
      const stat = await fs.stat(fileName)
      if (!stat.isFile()) {
        throw new Error(`${fileName} is not a file`)
      }
      if (stat.size === 0) {
        throw new Error(`Empty file: "${fileName}"`)
      }
    }

    // Let the module system do the caching.
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
   * @type {import('./loaded').LoaderMap}
   */
  static map = {
    '': this.loadYaml,
    'package.json': this.loadPackageJson,
    'sum.config.json': this.loadPackageJson,
    '.yaml': this.loadYaml,
    '.yml': this.loadYaml,
    '.json': this.loadJson,
    '.js': this.loadJs,
    '.mjs': this.loadJs,
  }

  /**
   * Pick the correct loader, and call it.
   *
   * @param {string} appName The application name.
   * @param {string} fileName The full path of the file to load.
   * @param {import('./loaded').Options} opts Options for loading.
   * @returns {Promise<Loaded>} The loaded config, or {} if
   *   there was an ignorable error.
   * @throws {Error} No known loader for this file type.
   */
  static async loadFile(appName, fileName, opts) {
    const p = path.parse(fileName)
    const ldrs = opts?.loaders || Loaders.map

    const loader = ldrs[p.base] ?? ldrs[p.ext]
    if (!loader) {
      throw new Error(`Invalid file, no loader "${fileName}"`)
    }
    const options = await loader(appName, fileName, opts)
    return new Loaded(
      appName,
      fileName,
      loader.name,
      options
    )
  }
}
