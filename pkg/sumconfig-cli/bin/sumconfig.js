#!/usr/bin/env node
/* eslint-disable no-console */

import * as path from 'path'
import * as util from 'util'
import {Command} from 'commander'
import SumConfig from 'sumconfig'

/* Stop configuring yourself.  Stop configuring yourself. */
const self = 'sumconfig'
const metaConfig = SumConfig.defaultMeta(self)
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
    console.log(SumConfig.defaultMeta(packageName))
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
  .option(
    '--start-dir <path>',
    'Where to start searching from',
    metaConfig.startDir
  )
  .option(
    '--stop-dir <path>',
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
    const m = SumConfig.defaultMeta(packageName)
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

    const source = Boolean(opts.source)
    delete opts.source

    const msc = new SumConfig(self, metaConfig)
    const config = {
      ...m,
      ...await msc.gather(self, metaConfig),
      ...opts,
    }

    const globalOpts = program.opts()
    if (globalOpts.verbose) {
      config.log.enabled = true
    }

    const sc = new SumConfig(packageName, config)
    const sum = await sc.gather()
    const cwd = process.cwd()
    if (source) {
      const src = {}
      for (const [k, v] of Object.entries(sum)) {
        const f = sc.source(k)
        src[f] ??= {}
        src[f][k] = v
      }
      for (const [f, o] of Object.entries(src)) {
        console.log(`from "${path.relative(cwd, f)}":`)
        for (const [k, v] of Object.entries(o)) {
          console.log(`  ${k}:`, util.inspect(v, {
            depth: Infinity,
            colors: process.stdout.isTTY,
            maxArrayLength: Infinity,
            maxStringLength: Infinity,
          }))
        }
      }
    } else {
      console.log(util.inspect(sum, {
        depth: Infinity,
        colors: process.stdout.isTTY,
        maxArrayLength: Infinity,
        maxStringLength: Infinity,
      }))
    }
  })

await program.parseAsync()
