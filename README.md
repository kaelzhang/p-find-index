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
  findIndex
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
console.log(await findIndex(input, matcher))                    // 2
console.log(await findIndex(input, matcher, {leftMost: false})) // 0
```

### find(iterable, matcher, options): any
### findIndex(iterable, matcher, options): number

- **iterable** `Iterable<Thenable | any>`
- **matcher** `Function`

## License

[MIT](LICENSE)
