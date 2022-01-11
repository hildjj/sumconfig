import Combiners from '../lib/combiners.js'
// eslint-disable-next-line node/no-missing-import
import test from 'ava'

test('combine', async t => {
  t.deepEqual(await Combiners.combine(undefined, () => ({fn: 12})), {fn: 12})
  t.deepEqual(await Combiners.combine(12, {fn: 12}), {fn: 12})
  t.deepEqual(await Combiners.combine(12, /foo/), /foo/)
  // eslint-disable-next-line no-new-wrappers
  t.is(await Combiners.combine(12, new Number(12)), 12)
})

test('typed array', async t => {
  t.deepEqual(
    await Combiners.combine(new Uint8Array([1, 2]), new Uint8Array([3, 4])),
    new Uint8Array([3, 4])
  )
  t.deepEqual(
    await Combiners.combine(undefined, new Int8Array([3, 4])),
    new Int8Array([3, 4])
  )
  t.deepEqual(
    await Combiners.combine(new Int8Array([1, 2]), new Uint8Array([3, 4])),
    new Uint8Array([3, 4])
  )
})

test('collections', async t => {
  t.deepEqual(
    await Combiners.combine(
      new Map([[1, 2], [3, 5]]), new Map([[1, 3], [2, 4]])
    ),
    new Map([[1, 3], [3, 5], [2, 4]])
  )
  t.deepEqual(
    await Combiners.combine(null, new Map([[1, 3], [2, 4]])),
    new Map([[1, 3], [2, 4]])
  )

  t.deepEqual(
    await Combiners.combine(new Set([1, 2]), new Set([2, 3])),
    new Set([1, 2, 3])
  )
  t.deepEqual(
    await Combiners.combine({}, new Set([2, 3])),
    new Set([2, 3])
  )
})

test('errors', async t => {
  await t.throwsAsync(() => Combiners.combine(null, new Error('test')))
})

test('promise', async t => {
  t.is(await Combiners.combine(null, Promise.resolve(12)), 12)
  t.deepEqual(
    await Combiners.combine({p: 12}, Promise.resolve({p: 13})), {p: 13}
  )
})
