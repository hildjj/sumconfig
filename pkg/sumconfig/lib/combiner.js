/**
 * @callback Combine
 * @param {any} a The previous value.
 * @param {import('./types.js').Loaded|any} b The new value.
 * @param {boolean} top Top-level file, b is a Loaded.
 * @returns {Promise | any} The combined value.
 * @throws {TypeError} Unknown JS type.
 */

export default class Combiner {
  static COMBINER = Symbol.for('sumconfig.combiner')

  /** @type {{[topLevelKey: string]: string}} */
  top = {}

  /** @type {import('./types').Options} */
  opts = null

  /**
   * Create a Combiner.
   *
   * @param {import('./types').Options} opts Options.
   */
  constructor(opts) {
    this.opts = opts
  }

  /**
   * What was the final source file for a given top-level key?
   *
   * @param {string} key The top-level key.
   * @returns {string} The fully-qualified file name.
   */
  source(key) {
    return this.top[key]
  }

  /**
   * @private
   * @param {any} a Previous value.
   * @param {Array} b New value.
   * @returns {Array} Combined value.
   */
  static Array(a, b) {
    // Array onto not-array overwites.
    if (!Array.isArray(a)) {
      return b
    }
    return a.concat(b)
  }

  /**
   * @private
   * @param {any} a Previous value.
   * @param {Map} b New value.
   * @returns {Map} Combined value.
   */
  static Map(a, b) {
    if (!(a instanceof Map)) {
      return b
    }
    return new Map([...a.entries(), ...b.entries()])
  }

  /**
   * @private
   * @param {any} a Previous value.
   * @param {Set} b New value.
   * @returns {Set} Combined value.
   */
  static Set(a, b) {
    if (!(a instanceof Set)) {
      return b
    }
    // Union
    return new Set([...a, ...b])
  }

  /* eslint-disable jsdoc/check-tag-names, jsdoc/no-undefined-types */

  /**
   * @private
   * @template {{valueOf(): U}} T Any boxed type.
   * @template U
   * @param {any} _ Previous value.
   * @param {T} b New value.
   * @returns {U} Combined value.
   */
  static boxed(_, b) {
    return b.valueOf()
  }

  /**
   * @private
   * @param {Promise<any>|any} a Previous value.
   * @param {Promise<any>} b New value.
   * @param {boolean} top Should always be false.
   * @returns {Promise<any>} The combined value.
   */
  async Promise(a, b, top) {
    return this.combine(a, await b, top)
  }

  /* eslint-ensable jsdoc/check-tag-names, jsdoc/no-undefined-types */
  /**
   * @type {Object.<string,Combine>}
   */
  static map = {
    // Try to figure out what to do with all of these:
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects
    Array: this.Array,
    BigInt: this.boxed,
    String: this.boxed,
    Number: this.boxed,
    Promise: Combiner.prototype.Promise,
    Map: this.Map,
    Set: this.Set,
  }

  /**
   * Combine the contents of different config options together in an
   * opinionated fashion.
   *
   * @param {any} a The pre-existing value.  Might
   *   be undefined.
   * @param {import('./types.js').Loaded|any} b The new value.
   * @param {boolean} [top=true] Is this a top-leve combination?  If so, b
   *   has type Loaded.
   * @returns {Promise<any>} A careful combination of a and b.
   * @throws {TypeError} Unknown JS type.  Should be impossible until new JS
   *   types get added again.
   */
  async combine(a, b, top = true) {
    const tb = typeof b

    switch (tb) {
      case 'bigint':
      case 'boolean':
      case 'number':
      case 'string':
      case 'symbol':
      case 'undefined':
        return b
      case 'function':
        return this.combine(a, await b(a, this, top), false)
      case 'object': {
        if (!b) {
          // Null overwrites.  Is that correct?
          return b
        }
        if (b instanceof Error) {
          throw b
        }
        if (typeof b[Combiner.COMBINER] === 'function') {
          return b[Combiner.COMBINER](a, this, top)
        }
        const bcn = b.constructor?.name
        if (bcn && (bcn !== 'Object')) {
          const combiner = Combiner.map[bcn]
          if (combiner) {
            return combiner.call(this, a, b, top)
          }

          // For anything with a prototytpe that isn't special, overwrite.
          // Examples: Date, RegExp, etc.
          return b
        }

        if (!a || (typeof a !== 'object')) {
          a = {}
        }

        for (const [k, v] of Object.entries(b)) {
          // I think this warning is wrong, but look for race conditions.
          // eslint-disable-next-line require-atomic-updates
          a[k] = await this.combine(a[k], v, false)
        }
        return a
      }

      /* c8 ignore next */
      default:
        /* c8 ignore next */
        throw new TypeError(`Unknown JS type: "${tb}"`)
    }
  }
}
