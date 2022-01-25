import * as path from 'path'
import * as util from 'util'
import {Command, Option} from 'commander'
import SumConfig from 'sumconfig'

/* Stop configuring yourself.  Stop configuring yourself. */
const self = 'sumconfig'
const metaConfig = SumConfig.defaultMeta(self)
metaConfig.fileNames = [
  'sum.config.js',
  'sum.config.mjs',
  'package.json',
]

/**
 * @typedef {object} StreamStub
 * @property {(s: string) => boolean} write Write string to "stream".
 * @property {boolean} isTTY Is this "stream" connected to a TTY?
 */

/**
 * Configure the command-line interface.
 *
 * @param {StreamStub} [stdout=process.stdout] Where to send output.
 * @returns {Command} The command, ready to be called with
 *   .parseAsync().
 */
export default function cli(stdout = process.stdout) {
  const program = new Command()
  if (stdout !== process.stdout) {
    program.exitOverride()
  }

  program.option('-v,--verbose', 'Turn on verbose logging')

  program.command('defaults')
    .argument('<packageName>', 'The name of the package to search for')
    .description('Get the default options')
    .action(packageName => {
      stdout.write(`${util.inspect(SumConfig.defaultMeta(packageName), {
        depth: Infinity,
        colors: process.stdout.isTTY,
        maxArrayLength: Infinity,
        maxStringLength: Infinity,
      })}\n`)
    })

  program
    .command('get', {isDefault: true})
    .argument('<packageName>', 'The name of the package to search for')
    .description('Get the combined configuration for package')
    .option('-s,--source', 'Output the source file for each option set')
    .option(
      '-e, --error-on-empty',
      'Throw an error if a config file exists, but it is empty',
      metaConfig.errorOnEmpty
    )
    .addOption(
      new Option('--start-dir <path>', 'Where to start searching from')
        .default(metaConfig.startDir, 'Current working directory')
    )
    .addOption(
      new Option(
        '--stop-dirs <path>',
        'Stop searching when one of these comma-separated directory is reached'
      )
        .default(metaConfig.stopDirs, 'User\'s home directory')
        .argParser((v, _) => v.split(','))
    )
    .option(
      '--stop-peers <file,names>',
      'Stop searching when a file or directory of one of these comma-separated name is in the directory',
      v => v.split(','),
      metaConfig.stopPeers
    )
    .option(
      '-f,--files <file,name>',
      'Add the given comma-separated filenames to the list to be searched',
      (v, p) => (p ?? []).concat(v.split(','))
    )
    .option(
      '-R,-reset-file-names',
      'Remove the current list of file names to be searched.  Requires -f.'
    )
    .action(async(packageName, opts, cmd) => {
      const m = SumConfig.defaultMeta(packageName)
      const msc = new SumConfig(self, metaConfig)
      const config = {
        ...m,
        ...await msc.gather(),
        ...opts,
      }

      const globalOpts = program.opts()
      if (globalOpts.verbose) {
        config.log.enabled = true
      }
      config.log('Initial opts: %O', opts)

      if (opts.files) {
        config.fileNames = opts.ResetFileNames ?
          opts.files :
          [...m.fileNames, ...opts.files]
        delete config.files
        delete config.ResetFileNames
      } else if (opts.ResetFileNames) {
        program.error('Must specify -f/--files if you reset file names with -R.', {
          code: 'sumconfig.required',
        })
      }

      const source = Boolean(opts.source)
      delete config.source

      config.log('config: %O', config)

      const sc = new SumConfig(packageName, config)
      const sum = await sc.gather()
      const cwd = process.cwd()
      if (source) {
        const src = {}
        for (const [k, v] of Object.entries(sum)) {
          const f = sc.source(k)
          if (src[f] == null) {
            src[f] = {}
          }
          src[f][k] = v
        }
        for (const [f, o] of Object.entries(src)) {
          stdout.write(`from "${path.relative(cwd, f)}":\n`)
          for (const [k, v] of Object.entries(o)) {
            stdout.write(`  ${k}: ${util.inspect(v, {
              depth: Infinity,
              colors: process.stdout.isTTY,
              maxArrayLength: Infinity,
              maxStringLength: Infinity,
            })}\n`)
          }
        }
      } else {
        stdout.write(`${util.inspect(sum, {
          depth: Infinity,
          colors: process.stdout.isTTY,
          maxArrayLength: Infinity,
          maxStringLength: Infinity,
        })}\n`)
      }
    })
  return program
}
