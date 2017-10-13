# rfc6902 simple diff generator
======================

An extremely simple JSON patch diff tool that generates rfc6902 compliant add, remove, and replace operations only.

If you are looking for a complete implementation of rfc6902 for diffing (creating ops) and patching (applying ops to objects), please check out @chbrown's [rfc6902](https://www.npmjs.org/package/rfc6902).

If you only need add, remove, and replace operations, but you also need diffing and patching support, check out Cujo.js's [jiff](https://www.npmjs.org/package/jiff).

## New in 2.0.0
Version 1 had a dependency on the venerable [underscore](https://underscorejs.org) library. I (and many other JS developers) no longer use underscore, preferring the modularity and modernity of Lodash, so I felt it was time to remove that dependency.

To that end, I created a standalone version as the main module (`require('rfc6902-simple-diff')`), and a lodash dependent version (`require('rfc6902-simple-diff/lib/lodash')`).

The standalone version is slightly faster due to its optimized (if significantly less compatible with aged and edge-case environments) isEqual implementation.

The standalone version minifies to 1.86Kb whereas the lodash version lands at about half that (.89Kb).

**tl;dr** Use the lodash version if you already use lodash in your project and bundle size is precious. Otherwise, use the (default) standalone and enjoy the performance benefits.

## Getting started
-----

```shell
npm install rfc6902-simple-diff
```

```javascript
var simpleDiff = require('rfc6902-simple-diff');

var lhs = {
    foo: "bar",
    baz: { bar: "foo" },
    qux: ["foo", "bar"]
};

var rhs = {
    foo: "baz",
    baz: { qux: "bar" },
    qux: ["foo","baz", "biz"]
};

console.log(simpleDiff(lhs, rhs));


// Outputs:
[
    { op: 'replace', path: '/foo', value: 'baz' },
    { op: 'remove', path: '/baz/bar' },
    { op: 'add', path: '/baz/qux', value: 'bar' },
    { op: 'replace', path: '/qux/1', value: 'baz' },
    { op: 'add', path: '/qux/-', value: 'biz' }
]
```

Customizing output
------

You can call the diff function with optional options object to customize output.


```javascript

console.log(simpleDiff(lhs, rhs, {path: 'bub'}));


// Outputs:
[
    { op: 'replace', path: '/bub/foo', value: 'baz' },
    { op: 'remove', path: '/bub/baz/bar' },
    { op: 'add', path: '/bub/baz/qux', value: 'bar' },
    { op: 'replace', path: '/bub/qux/1', value: 'baz' },
    { op: 'add', path: '/bub/qux/2', value: 'biz' }
]

console.log(simpleDiff(lhs, rhs, {append: false}))

// Outputs:
[
    { op: 'replace', path: '/foo', value: 'baz' },
    { op: 'remove', path: '/baz/bar' },
    { op: 'add', path: '/baz/qux', value: 'bar' },
    { op: 'replace', path: '/qux/1', value: 'baz' },
    { op: 'add', path: '/qux/2', value: 'biz' }
]
```

## Acknowledgements

Thanks to [Caasi Huang](https://github.com/caasi) for developing the original rfc6902 module that I forked.
Thanks to [Zachary R. Smith](https://github.com/ZacharyRSmith) for pointing out that jiff's diff isn't a full implementation since it only supports add, remove, and replace operations.
