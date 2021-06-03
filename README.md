[![Build Status](https://travis-ci.org/kaelzhang/p-find-index.svg?branch=master)](https://travis-ci.org/kaelzhang/p-find-index)
[![Coverage](https://codecov.io/gh/kaelzhang/p-find-index/branch/master/graph/badge.svg)](https://codecov.io/gh/kaelzhang/p-find-index)
<!-- optional appveyor tst
[![Windows Build Status](https://ci.appveyor.com/api/projects/status/github/kaelzhang/p-find-index?branch=master&svg=true)](https://ci.appveyor.com/project/kaelzhang/p-find-index)
-->
<!-- optional npm version
[![NPM version](https://badge.fury.io/js/p-find-index.svg)](http://badge.fury.io/js/p-find-index)
-->
<!-- optional npm downloads
[![npm module downloads per month](http://img.shields.io/npm/dm/p-find-index.svg)](https://www.npmjs.org/package/p-find-index)
-->
<!-- optional dependency status
[![Dependency Status](https://david-dm.org/kaelzhang/p-find-index.svg)](https://david-dm.org/kaelzhang/p-find-index)
-->

# p-find-index

Wait for a left-most matched promise to be fulfilled

## Install

```sh
$ npm i p-find-index
```

## Usage

```js
import {
  find,
  findIndex,
  AggregateError,
  MatchError
} from 'p-find-index'

import delay from 'delay'

const input = [
  delay(100).then(() => 100),
  delay(50).then(() => 10),
  delay(60).then(() => 90)
]

const matcher = value => value > 50

console.log(await find(input, matcher))                         // 100
console.log(await find(input, matcher, {leftMost: false}))      // 90
console.log(await findIndex(input, matcher))                    // 0
console.log(await findIndex(input, matcher, {leftMost: false})) // 2
```

### find(iterable, matcher, options): any
### findIndex(iterable, matcher, options): number

Returns a cancelable `Promise` that is fulfilled when the first match is found. If `options.leftMost` is `true`, then it will find the left-most match of the `iterable`.

If you pass in cancelable promises each of which have an `cancel()` method, that method will be called when the target value has been found and the thenable is still pending.

- **iterable** `Iterable<Thenable | any>` an `Iterable` collection of thenables/values to wait for.
- **matcher** `Function` receives the value resolved by the thenable and returns a boolean whether the value is matched some condition.
- **options** `Object`
  - **leftMost** `boolean = true`

### AggregateError

Exposed for instance checking.

### MatchError

Exposed for instance checking.

## License

[MIT](LICENSE)
