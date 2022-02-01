
/**
 * Options that have been loaded from a file.
 */
export class Loaded {
  /** @type {string} */
  appName

  /** @type {string} */
  fileName

  /** @type {string} */
  loader

  /** @type {OptInitial} */
  options

  stamp = new Date()
  root = false

  /**
   * Create a Loaded.
   *
   * @param {string} appName The application name.
   * @param {string} fileName The source file name.
   * @param {string} loader The function name used to load.
   * @param {OptInitial} options Either a (potentially async) function
   *   that will return the options, or an object.
   */
  constructor(appName, fileName, loader, options) {
    this.appName = appName
    this.fileName = fileName
    this.loader = loader
    this.options = options
  }

  /**
   * Combine top-level objects loaded from files.
   *
   * @param {any} prev Previous value.
   * @param {any} combiner The combiner.  Marked as "any" to prevent circular
   *   dependency.
   * @param {boolean} top Top level.  Should always be true.
   * @returns {Promise<object>} The combination of a and b.object.
   * @throws {Error} Invalid state.
   */
  async [Symbol.for('sumconfig.combiner')](prev, combiner, top) {
    if (!top) {
      throw new Error('Invalid state')
    }

    prev = (prev && (typeof prev === 'object')) ? prev : {}
    const opts = (typeof this.options === 'function') ?
      await this.options(prev, combiner, false) :
      this.options
    combiner.opts.log('Source "%s": %O', this.fileName, opts)
    if (combiner.opts.stopKey) {
      const root = opts[combiner.opts.stopKey]
      if ((typeof root === 'boolean') && root) {
        // Not optimal, since all of the previous files will have been read,
        // and their functions called.
        combiner.opts.log(`Discarding previous options because ${combiner.opts.stopKey} key found`)
        prev = {}
        this.root = true
      }
    }

    for (const [k, v] of Object.entries(opts)) {
      combiner.top[k] = this.fileName
      // eslint-disable-next-line require-atomic-updates
      prev[k] = await combiner.combine(prev[k], v, false)
    }
    combiner.opts.log('combined: %O', prev)
    return prev
  }
}

/**
 * Options for gathering options.
 *
 * @typedef {object} Options
 * @property {boolean} [errorOnEmpty = false] Throw an error if a config file
 *   exists, but it is empty.
 * @property {LoaderMap} [loaders] Map from file name or extension (including
 *   dot) to a Loader function.  Defaults to loaders for package.json, .json,
 *   .yaml, .yml, .js (modules only!), and .mjs.  Use "" for files with no
 *   extension (defaults to the YAML loader, which handles JSON slightly
 *   slower than the JSON loader).
 * @property {string} [startDir=process.cwd()] Where to start searching from.
 * @property {string[]} [stopDirs=[homedir]] If we get to any of these
 *   directories, stop.
 * @property {string[]} [stopPeers=['.git', '.hg']] Stop when a file or
 *   directory of one of these names is found in a directory we visit.
 * @property {string[]} [dirs] What directories to search.  If not specified,
 *   will start at startDir and go to stopDir, going up a directory each time.
 *   Directories closer to the current directory take precedence.
 * @property {string[]} [fileNames] What file names to check.  If not
 *   specified, will use a list based on the appName.
 * @property {(formatter: any, ...args: any[]) => void} log Logging function.
 *   Defaults to debug('sumconfig'), which allows turning on logging with the
 *   environment variable `DEBUG=sumconfig`.
 * @property {boolean} [ignoreUser=false] Ignore user-wide configuration files
 *   (in $XDG_CONFIG_HOME, for example).
 * @property {string?} [stopKey='root'] Stop when this key is in a config, is
 *    a boolean, and its value is false.  Set to null to turn off this
 *    behavior.
 */

/**
 * @callback Loader
 * @param {string} appName The application name.
 * @param {string} fileName The full path of the file to load.
 * @param {Options} opts Options for loading.
 * @returns {Promise<OptInitial>} The loaded config, or {} if there was an
 *   ignorable error.
 */

/** @typedef {Object.<string, Loader>} LoaderMap */

/** @typedef {object | function} OptInitial */
