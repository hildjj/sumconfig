import * as fs from 'fs/promises'
import {clearCaches, sumconfig} from '../lib/index.js'
import Walker from '../lib/walker.js'
import envPaths from 'env-paths'
import {pEvent} from 'p-event'
import path from 'path'
// eslint-disable-next-line node/no-missing-import
import test from 'ava'
import url from 'url'

const startDir = url.fileURLToPath(new URL('fixtures/a/b/c', import.meta.url))
const stopDirs = [url.fileURLToPath(new URL('fixtures', import.meta.url))]
const badDir = url.fileURLToPath(new URL('fixtures/bad', import.meta.url))
const UNUSED_APP = '______UNUSED_____TEST_____APP____'
const {config} = envPaths(UNUSED_APP)

test.before('create user-scope config', async t => {
  try {
    await fs.stat(config)
    throw new Error(`directory already exists: ${config}`)
  } catch {
    // Ignored
  }

  await fs.mkdir(config, {recursive: true})
  await fs.writeFile(
    path.join(config, '______UNUSED_____TEST_____APP____.config.mjs'),
    'export default { used: NaN }\n'
  )
})

test.after('clear cache', t => {
  t.true(Object.keys(Walker.cache).length > 0)
  clearCaches()
  t.is(Object.keys(Walker.cache).length, 0)
})

test.after.always('destroy user-scope config', async t => {
  await fs.rmdir(config, {recursive: true, force: true})
})

test('first', async t => {
  const res = await sumconfig('foo', {startDir, stopDirs})
  t.snapshot(res)
  const cached = await sumconfig('foo', {
    startDir,
    stopDirs,
    stopKey: 'testRoot',
  })
  t.snapshot(cached)
})

test('stopPeers', async t => {
  const res = await sumconfig('foo', {
    startDir,
    stopDirs,
    stopPeers: ['foo.config.js'],
  })
  t.snapshot(res)
})

test('package.json', async t => {
  const res = await sumconfig('three', {startDir: badDir, stopDirs})
  t.deepEqual(res, {good: 'news'})
})

test('user', async t => {
  const res = await sumconfig(UNUSED_APP, {startDir, stopDirs})
  t.snapshot(res)
})

test('errors', async t => {
  await t.throwsAsync(() => sumconfig('.foo'), {message: /Invalid appName/})

  const warn = pEvent(process, 'warning')
  await sumconfig('Poo\u{1F4A9}', {startDir, stopDirs})
  const w = await warn
  t.true(w instanceof Error)
  t.is(w.code, 'sumconfig.suspectName')

  await t.throwsAsync(() => sumconfig('foo', {
    startDir: badDir,
    fileNames: ['foo.bar'],
  }), {message: /Invalid file, no loader/})

  await t.throwsAsync(
    () => sumconfig('bar', {startDir, stopDirs}),
    {code: 'ERR_UNSUPPORTED_DIR_IMPORT'}
  )
  await t.throwsAsync(
    () => sumconfig('bar', {startDir, stopDirs, errorOnEmpty: true}),
    {message: /is not a file/}
  )
  await t.throwsAsync(
    () => sumconfig('baz', {startDir, stopDirs, errorOnEmpty: true}),
    {message: /Empty file/}
  )
  await t.throwsAsync(
    () => sumconfig('baz', {startDir, stopDirs}),
    {message: /Must have object or function as default export/}
  )
  await t.throwsAsync(
    () => sumconfig('one', {startDir: badDir, stopDirs}),
    {message: /expected object/}
  )
  await t.throwsAsync(
    () => sumconfig('two', {startDir: badDir, stopDirs}),
    {message: /expected object/}
  )
  await t.throwsAsync(
    () => sumconfig('four', {startDir: badDir, stopDirs}),
    {message: /column 1 in/}
  )
  await t.throwsAsync(
    () => sumconfig('five', {startDir: badDir, stopDirs}),
    {message: /illegal operation on a directory/}
  )
  await t.throwsAsync(
    () => sumconfig('six', {startDir: badDir, stopDirs, errorOnEmpty: true}),
    {message: /Empty file/}
  )
  t.deepEqual(await sumconfig('six', {startDir: badDir, stopDirs}), {})
  t.deepEqual(await sumconfig('seven', {startDir: badDir, stopDirs}), {})
})

