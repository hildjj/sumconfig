import * as fs from 'fs/promises'
import * as path from 'path'
import envPaths from 'env-paths'

export default class Walker {
  /** @type {Object<string,string[]|Promise<string[]>>} */
  static cache = {}

  static clearCache() {
    Walker.cache = {}
  }

  /**
   * Find the contents of a directory, with caching.
   *
   * @param {string} dirname The directory to search.
   * @returns {Promise<string[]>} The contents of the directory.
   */
  static async getDir(dirname) {
    let res = Walker.cache[dirname]
    if (!res) {
      const dir = fs.readdir(dirname) // Promise
      Walker.cache[dirname] = dir
      res = await dir

      // I think this isn't a problem unless someone calls clearCache()
      // while we're waiting, but even then I think it's a completely
      // reasonable result.
      // eslint-disable-next-line require-atomic-updates
      Walker.cache[dirname] = res
    }

    // If res is a promise, the right thing will happen.
    return res
  }

  /**
   * Walk the directory path, starting at opts.startDir and ending at
   * opts.stopDir or the root of startDir's file system.  Return all
   * of the filenames from opts that exist on those paths.
   *
   * @param {string} appName The application name.
   * @param {import('./types').Options} opts Options.
   * @returns {Promise<string[]>} The directories.
   */
  static async allDirs(appName, opts) {
    const p = []

    let dir = opts.startDir
    const stopDirs = new Set(opts.stopDirs)
    stopDirs.add(path.parse(dir).root)
    const stopPeers = new Set(opts.stopPeers)
    const fileNames = new Set(opts.fileNames)

    /**
     * @private
     * @param {string} d Directory to search.
     * @returns {Promise<string | null>} Next directory or null.
     */
    async function addDir(d) {
      opts.log('Looking in "%s"', d)
      let contents = null
      try {
        contents = await Walker.getDir(d)
      } catch (e) {
        if (e.code === 'ENOENT') {
          return null
        }
        throw e
      }

      const files = contents.flatMap(
        f => (fileNames.has(f) ? path.join(d, f) : [])
      )
      if (files.length) {
        opts.log('Found %O', files)
        p.push(...files)
      }

      if (stopDirs.has(d)) {
        opts.log('Stopping on stopDir "%s"', d)
        return null
      }
      const peer = contents.filter(f => stopPeers.has(f))
      if (peer.length) {
        opts.log('Stopping on stopPeer "%s/%s"', d, peer[0])
        return null
      }
      return path.dirname(d)
    }

    while (dir) {
      dir = await addDir(dir)
    }

    if (!opts.ignoreUser) {
      await addDir(envPaths(appName).config)
    }
    return p
  }
}
