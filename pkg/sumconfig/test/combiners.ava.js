import Combiner from '../lib/combiner.js'
import {Loaded} from '../lib/types.js'

// eslint-disable-next-line node/no-missing-import
import test from 'ava'

test('combine', async t => {
  const comb = new Combiner()
  t.deepEqual(await comb.combine(undefined, () => ({fn: 12}), false), {fn: 12})
  t.deepEqual(await comb.combine(12, {fn: 12}, false), {fn: 12})
  t.deepEqual(await comb.combine(12, /foo/, false), /foo/)
  // eslint-disable-next-line no-new-wrappers
  t.is(await comb.combine(12, new Number(12)), 12)
})

test('typed array', async t => {
  const comb = new Combiner()
  t.deepEqual(
    await comb.combine(new Uint8Array([1, 2]), new Uint8Array([3, 4]), false),
    new Uint8Array([3, 4])
  )
  t.deepEqual(
    await comb.combine(undefined, new Int8Array([3, 4]), false),
    new Int8Array([3, 4])
  )
  t.deepEqual(
    await comb.combine(new Int8Array([1, 2]), new Uint8Array([3, 4]), false),
    new Uint8Array([3, 4])
  )
})

test('collections', async t => {
  const comb = new Combiner()
  t.deepEqual(
    await comb.combine(
      new Map([[1, 2], [3, 5]]), new Map([[1, 3], [2, 4]]), false
    ),
    new Map([[1, 3], [3, 5], [2, 4]])
  )
  t.deepEqual(
    await comb.combine(null, new Map([[1, 3], [2, 4]]), false),
    new Map([[1, 3], [2, 4]])
  )

  t.deepEqual(
    await comb.combine(new Set([1, 2]), new Set([2, 3]), false),
    new Set([1, 2, 3])
  )
  t.deepEqual(
    await comb.combine({}, new Set([2, 3]), false),
    new Set([2, 3])
  )
})

test('errors', async t => {
  const comb = new Combiner()
  await t.throwsAsync(() => comb.combine(null, new Error('test'), false))
})

test('promise', async t => {
  const comb = new Combiner()

  t.is(await comb.combine(null, Promise.resolve(12), false), 12)
  t.deepEqual(
    await comb.combine({p: 12}, Promise.resolve({p: 13}), false), {p: 13}
  )
})

test('source', async t => {
  const comb = new Combiner({
    log() {
      // Ignored.
    },
  })
  const ld = new Loaded(
    'foo',
    'foo.config.js',
    'explicit',
    {
      bar: 12,
    }
  )

  const opts = await comb.combine({bar: 11}, ld, true)
  t.deepEqual(opts, {bar: 12})
  t.is(comb.source('bar'), 'foo.config.js')
  await t.throwsAsync(() => comb.combine({bar: 10}, ld, false))
})
