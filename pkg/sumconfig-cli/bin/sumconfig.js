#!/usr/bin/env node

import * as util from 'util'
import {defaultMeta, sumconfig} from 'sumconfig'
import {Command} from 'commander'

/* Stop configuring yourself.  Stop configuring yourself. */
const self = 'sumconfig'
const metaConfig = defaultMeta(self)
metaConfig.fileNames = [
  'sum.config.js',
  'sum.config.mjs',
  'package.json',
]

const program = new Command()
program.option('-v,--verbose', 'Turn on verbose logging')

program.command('defaults')
  .argument('<packageName>', 'The name of the package to search for')
  .description('Get the default options')
  .action(packageName => {
    console.log(defaultMeta(packageName))
  })

program
  .command('get', {isDefault: true})
  .argument('<packageName>', 'The name of the package to search for')
  .description('Get the combined configuration for package')
  .option(
    '-e, --error-on-empty',
    'Throw an error if a config file exists, but it is empty',
    metaConfig.errorOnEmpty
  )
  .option(
    '--start-dir <path>',
    'Where to start searching from',
    metaConfig.startDir
  )
  .option(
    '--start-dir <path>',
    'Stop searching when this directory is reached',
    metaConfig.stopDir
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
    const m = defaultMeta(packageName)
    if (opts.files) {
      opts.fileNames = opts.ResetFileNames ?
        [...opts.files, ...m.fileNames] :
        m.fileNames
      delete opts.fileNames
      delete opts.ResetFileNames
    } else if (opts.ResetFileNames) {
      program.error('Must specify -f/--files if you reset file names with -R.', {
        code: 'sumconfig.required',
      })
    }
    const config = {
      ...m,
      ...sumconfig(self, metaConfig),
      ...opts,
    }

    const globalOpts = program.opts()
    if (globalOpts.verbose) {
      config.log.enabled = true
    }

    console.log(util.inspect(await sumconfig(packageName, config), {
      depth: Infinity,
      colors: process.stdout.isTTY,
      maxArrayLength: Infinity,
      maxStringLength: Infinity,
    }))
  })

await program.parseAsync()
