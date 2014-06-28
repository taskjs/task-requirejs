# task-requirejs
> Optimize RequireJS projects using r.js.

## The "requirejs" task

### Usage Examples

```js
var requirejs = new (require('task-requirejs'))
requirejs.run(inputs, options, logger)
```

### Options

For a full list of possible options, [see the r.js example build file](https://github.com/jrburke/r.js/blob/master/build/example.build.js).

#### options.amdClean
Type: `boolean`
Default: `false`

Converts AMD code to standard JavaScript using [AMDclean](https://github.com/gfranko/amdclean).

## Release History
* 2014-06-29    0.1.0    Initial release.

## License
Copyright (c) 2014 Yuanyan Cao. Licensed under the MIT license.
