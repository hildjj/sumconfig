#!/usr/bin/env node

import cli from '../lib/cli.js'

const program = cli()
// eslint-disable-next-line no-console
program.parseAsync().catch(console.error)
