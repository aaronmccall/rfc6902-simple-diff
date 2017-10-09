rfc6902 simple diff generator
======================

An extremely simple JSON patch tool that generates rfc6902 compliant add, remove, and replace operations only.

If you are looking for a complete implementation(differ and patcher), please check out @chbrown's [rfc6902](https://www.npmjs.org/package/rfc6902).  If you are looking for a complete implementation of patching but just add/remove/replace operations for diffing please check out Cujo.js's [jiff](https://www.npmjs.com/package/jiff#diff).

Getting started
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
