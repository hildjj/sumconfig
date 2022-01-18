import * as util from 'util'
import Combiner from './combiner.js'
import Loaders from './loaders.js'
import Walker from './walker.js'
import {defaultMeta} from './defaults.js'

export {
  defaultMeta,
}

/**
 * Clear all caches retained by the library.
 */
export function clearCaches() {
  Walker.clearCache()
}

/**
 * Gather configurations together from all of the places we can find.
 *
 * @param {string} appName The application name.  All of the characters in the
 *   name should be safe for use in a filename.
 * @param {import('./types').Options} [opts] Options.
 * @returns {Promise<object>} The combined configurations.
 * @throws {Error} Invalid appName.
 */
export async function sumconfig(appName, opts) {
  opts = {
    ...defaultMeta(appName),
    ...opts,
  }

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
  const files = await Walker.allDirs(appName, opts)
  const all = await Promise.all(
    files.map(f => Loaders.loadFile(appName, f, opts))
  )
  const combiner = new Combiner(opts)
  // @ts-ignore
  return all.reduceRight(async(t, loaded) => {
    const ret = await combiner.combine(await t, loaded)
    return ret
  }, undefined)
}

export default sumconfig
