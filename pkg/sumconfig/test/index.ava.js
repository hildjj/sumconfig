import * as fs from 'fs/promises'
import {combine, sumconfig} from '../index.js'
import envPaths from 'env-paths'
import {pEvent} from 'p-event'
import path from 'path'
// eslint-disable-next-line node/no-missing-import
import test from 'ava'
import url from 'url'

const startDir = url.fileURLToPath(new URL('fixtures/a/b/c', import.meta.url))
const stopDir = url.fileURLToPath(new URL('fixtures', import.meta.url))
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

test.after.always('destroy user-scope config', async t => {
  await fs.rmdir(config, {recursive: true, force: true})
})

test('combine', t => {
  t.deepEqual(combine(undefined, () => ({fn: 12})), {fn: 12})
  t.deepEqual(combine(12, {fn: 12}), {fn: 12})
})

test('first', async t => {
  const res = await sumconfig('foo', {startDir, stopDir})
  t.snapshot(res)
})

test('package.json', async t => {
  const res = await sumconfig('three', {startDir: badDir, stopDir})
  t.deepEqual(res, {good: 'news'})
})

test('user', async t => {
  const res = await sumconfig(UNUSED_APP, {startDir, stopDir})
  t.snapshot(res)
})

test('errors', async t => {
  await t.throwsAsync(() => sumconfig('.foo'), {message: /Invalid appName/})

  const warn = pEvent(process, 'warning')
  await sumconfig('Poo\u{1F4A9}', {startDir, stopDir})
  const w = await warn
  t.true(w instanceof Error)
  t.is(w.code, 'sumconfig.suspectName')

  await t.throwsAsync(() => sumconfig('foo', {
    fileNames: ['.foo.bar'],
  }), {message: /Invalid file, no loader/})

  await t.throwsAsync(() => sumconfig('bar', {startDir, stopDir}), {message: /is not a file/})
  await t.throwsAsync(() => sumconfig('baz', {startDir, stopDir, errorOnEmpty: true}), {message: /Empty file/})
  await t.throwsAsync(() => sumconfig('baz', {startDir, stopDir}), {message: /Must have object or function as default export/})
  await t.throwsAsync(() => sumconfig('one', {startDir: badDir, stopDir}), {message: /expected object/})
  await t.throwsAsync(() => sumconfig('two', {startDir: badDir, stopDir}), {message: /expected object/})
  await t.throwsAsync(() => sumconfig('four', {startDir: badDir, stopDir}), {message: /column 1 in/})
  await t.throwsAsync(() => sumconfig('five', {startDir: badDir, stopDir}), {message: /illegal operation on a directory/})
  await t.throwsAsync(() => sumconfig('six', {startDir: badDir, stopDir, errorOnEmpty: true}), {message: /Empty file/})
  t.deepEqual(await sumconfig('six', {startDir: badDir, stopDir}), {})
})

