/**
 * Config stuff.
 *
 * @returns {object} Some config.
 */
export default function config() {
  return {
    bar: 12,
    boolean: false,
    bigint: 39n,
    symbol: Symbol.for('bar.symbol'),
    string: 'foot',
    undefined: 'defined',
    fn() {
      return {fnReturn: 99}
    },
    base: null,
    array: ['ho', 'hum'],
  }
}
