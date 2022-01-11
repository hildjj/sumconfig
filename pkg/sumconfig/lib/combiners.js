/**
 * @callback Combiner
 * @param {any} a The previous value.
 * @param {any} b The new value.
 * @returns {Promise | any} The combined value.
 * @throws {TypeError} Unknown JS type.
 */

export default class Combiners {
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
   * @template T
   * @param {any} _ Previous value.
   * @param {T} b New value.
   * @returns {T} The new value.
   */
  static overwrite(_, b) {
    return b
  }
  /* eslint-ensable jsdoc/check-tag-names, jsdoc/no-undefined-types */

  /**
   * @type {Object.<string,Combiner>}
   */
  static map = {
    // Try to figure out what to do with all of these:
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects
    Array: this.Array,
    Date: this.overwrite,
    BigInt: this.boxed,
    String: this.boxed,
    Number: this.boxed,
    RegExp: this.overwrite,
    Promise: this.overwrite, // Ha.  Since combine is async...
    Map: this.Map,
    Set: this.Set,
    WeakMap: this.overwrite,
    WeakSet: this.overwrite,

    // These are most likely to be used as the contents of files, for example,
    // so combining them makes no sense in general.
    ArrayBuffer: this.overwrite,
    SharedArrayBuffer: this.overwrite,
    DataView: this.overwrite,
    BigInt64Array: this.overwrite,
    BigUint64Array: this.overwrite,
    Float32Array: this.overwrite,
    Float64Array: this.overwrite,
    Int16Array: this.overwrite,
    Int32Array: this.overwrite,
    Int8Array: this.overwrite,
    Uint16Array: this.overwrite,
    Uint32Array: this.overwrite,
    Uint8Array: this.overwrite,
    Uint8ClampedArray: this.overwrite,
    Buffer: this.overwrite,
  }

  /**
   * Combine the contents of different config options together in an opinionated
   * fashion.
   *
   * @param {any} a The pre-existing value.  Might be undefined.
   * @param {any} b The new value.
   * @returns {Promise<any>} A careful combination of a and b.
   * @throws {TypeError} Unknown JS type.  Should be impossible until new
   *   JS types get added again.
   */
  static async combine(a, b) {
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
        return Combiners.combine(a, await b(a))
      case 'object': {
        if (!b) {
          // Null overwrites.  Is that correct?
          return b
        }
        // Not in map so that whatever error subclass you have will work.
        if (b instanceof Error) {
          throw b
        }
        const combiner = Combiners.map[b.constructor?.name]
        if (combiner) {
          return combiner(a, b)
        }
        if (!a || (typeof a !== 'object')) {
          a = {}
        }

        for (const [k, v] of Object.entries(b)) {
          // I think this warning is wrong, but look for race conditions.
          // eslint-disable-next-line require-atomic-updates
          a[k] = await Combiners.combine(a[k], v)
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
