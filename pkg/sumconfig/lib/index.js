import * as util from 'util'
import Combiner from './combiner.js'
import Loaders from './loaders.js'
import Walker from './walker.js'
import {defaultMeta as dm} from './defaults.js'

export default class SumConfig {
  static defaultMeta = dm

  /**
   * Create a SumConfig object.
   *
   * @param {string} appName The application name.  All of the characters in
   *   the name should be safe for use in a filename.
   * @param {import('./types').Options} [opts] Options.
   */
  constructor(appName, opts) {
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

    this.appName = appName
    this.opts = {
      ...SumConfig.defaultMeta(appName),
      ...opts,
    }
    this.combiner = new Combiner(this.opts)
  }

  /**
   * Clear all caches retained by the library.
   */
  static clearCaches() {
    Walker.clearCache()
    Loaders.clearCache()
  }

  /**
   * Gather configurations together from all of the places we can find.
   *
   * @returns {Promise<object>} The combined configurations.
   * @throws {Error} Invalid appName.
   */
  async gather() {
    const files = await Walker.allDirs(this.appName, this.opts)
    const all = await Promise.all(
      files.map(f => Loaders.loadFile(this.appName, f, this.opts))
    )
    let ret = undefined
    all.reverse()
    for (const loaded of all) {
      ret = await this.combiner.combine(ret, loaded)
    }
    return ret
  }

  /**
   * What was the final source file for a given top-level key?
   *
   * @param {string} key The top-level key.
   * @returns {string} The fully-qualified file name.
   */
  source(key) {
    return this.combiner.source(key)
  }
}
