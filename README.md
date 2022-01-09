# sumconfig

A system for gathering configuration/preference files from along your current
path, combining them together.  Will also handle user-scoped preference files
in your home directory (in the correct spot for your OS.)

## Installation

`npm install sumconfig`

(There will be more here once I write the CLI)

## Files checked

- `.${appName}rc`
- `.${appName}rc.json`
- `.${appName}rc.yml`
- `.${appName}rc.yaml`
- `.${appName}rc.js`
- `.${appName}rc.mjs`
- `${appName}.config.yml`
- `${appName}.config.yaml`
- `${appName}.config.js`
- `${appName}.config.mjs`
- package.json

## File types supported out of the box

- JSON
- YAML
- JS modules.  If your package.json has `"type": "module"`, then you can use
  .js, otherwise, use .mjs.
- package.json, with a section that looks like

```json
{
  "appName": {
    "foo": 12
  }
}
```

## API

```js
import sumconfig from 'sumconfig'

const config = sumconfig('foo', opts)
```

### Options

|Option|Type|Default|Meaning|
|------|----|-------|-------|
|errorOnEmpty|boolean|false|If there is a file that exists, but is empty, throw an error before trying to parse it.|
|loaders|{[x: string]: Loader}|`import {loaders} from 'sumconfig'`|How to load a file of the given name, or with the given extension.  Use "" for files with no extension (default for this case is YAML, which also handles JSON).|
|startDir|string|`process.cwd()`|Where to start the search?|
|stopDir|string|`os.homedir()`|If we get to this directory before the root directory, stop.|
|dirs|string[]|undefined|If defined, use this list of directories instead of walking up parent directories from startDir to stopDir.|
|fileNames|string[]|`import {fileNames} from 'sumconfig'`<br />`fileNames(appName)`|Try each of these filenames at each level of the path.|

## Similar projects

- [cosmiconfig](https://github.com/davidtheclark/cosmiconfig#readme): the
  inspiration for this library.  Always stops when it finds the first match,
  doesn't support user-scoped configs without some work, and doesn't support
  .mjs modules.
- [rc](https://github.com/dominictarr/rc#readme): very widely used, does configuration merging.  Only supports .ini and JSON files.  Tightly coupled with [minimist](https://github.com/substack/minimist) for arg parsing.

[![Tests](https://github.com/hildjj/sumconfig/actions/workflows/node.js.yml/badge.svg)](https://github.com/hildjj/sumconfig/actions/workflows/node.js.yml)
[![codecov](https://codecov.io/gh/hildjj/sumconfig/branch/main/graph/badge.svg?token=1LDKOFF2R6)](https://codecov.io/gh/hildjj/sumconfig)
