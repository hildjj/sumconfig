import cli from '../lib/cli.js'

// eslint-disable-next-line node/no-missing-import
import test from 'ava'
import url from 'url'

const startDir = url.fileURLToPath(
  new URL('../../sumconfig/test/fixtures/a/b/c', import.meta.url)
)
const stopDirs = [url.fileURLToPath(
  new URL('../../sumconfig/test/fixtures', import.meta.url)
)]

const dirArgs = [
  '--start-dir',
  startDir,
  '--stop-dirs',
  stopDirs.join(','),
]

async function runCli(args = []) {
  let stdout = ''
  let stderr = ''
  const program = cli({
    write(str) {
      stdout += str
    },
    isTTY: false,
  })
  program.configureHelp({
    helpWidth: 80,
  })

  program.configureOutput({
    writeOut(str) {
      stdout += str
    },
    writeErr(str) {
      stderr += str
    },
  })

  let err = undefined
  try {
    await program.parseAsync(args, {from: 'user'})
  } catch (e) {
    err = e
  }

  return {
    stdout,
    stderr,
    err,
  }
}

test('help', async t => {
  t.snapshot(await runCli(['--help']))
  t.snapshot(await runCli(['defaults', '--help']))
  t.snapshot(await runCli(['get', '--help']))
})

test('get', async t => {
  t.snapshot(await runCli(['foo', ...dirArgs]))
  t.snapshot(await runCli(['get', 'foo', '-s', ...dirArgs]))
  t.like(await runCli(['get', 'foo', '-R', ...dirArgs]), {
    err: {code: 'sumconfig.required'},
  })
  t.snapshot(await runCli(['get', 'foo', '-R', '-f', '.foorc', ...dirArgs]))
  t.snapshot(await runCli(['foo', '-f', '.bobrc', ...dirArgs]))
})

test('defaults', async t => {
  // Don't use snapshot, it would save local paths.
  const res = await runCli(['defaults', 'foo'])
  t.like(res, {
    err: undefined,
    stderr: '',
  })
})

test('verbose', async t => {
  const oldWrite = process.stderr.write
  let logs = ''
  process.stderr.write = str => (logs += str)
  t.snapshot(await runCli(['foo', '-v', ...dirArgs]))
  // Don't use snapshot, it would save local paths and times.
  t.true(logs.length > 0)
  // eslint-disable-next-line require-atomic-updates
  process.stderr.write = oldWrite
})
