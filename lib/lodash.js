var isArray = require('lodash/isArray')
var isPlainObject = require('lodash/isPlainObject')
var isEqual = require('lodash/isEqual')
var union = require('lodash/union')

function isArrayOrObject(value) {
  return isPlainObject(value) || isArray(value)
}

function preparePath(pathString) {
  if (!pathString) return '/'
  if (pathString.charAt(0) !== '/') return `/${pathString}`
  return pathString
}

function getParent(start, pathString) {
    var current = start
    var path = pathString.slice(1).split('/').slice(0, -1)
    var pathLen = path.length

    for (var i = 0, prop = path[i]; i < pathLen; i += 1) {
        current = current[prop]
        if (current == null) return current
    }

    return current
}

function _basicDiff(lhs, rhs, options) {
  var i$, key, pointer
  var path = preparePath(options.path)

  var operations = [];
  if (isArrayOrObject(lhs) && isArrayOrObject(rhs) ) {
    options.depth += 1;
    if (options.depth > 64) {
      throw new Error('Object depth exceeded 64 nested objects.');
    }
    var keys = union(Object.keys(lhs), Object.keys(rhs))
    i$ = -1;
    while ((key = keys[++i$])) {
      pointer = key.replace(/~/g, '~0').replace(/\//g, '~1');
      operations.push.apply(operations, _basicDiff(lhs[key], rhs[key], Object.assign(options, {path: ((path === '/') ? path : path + '/') + pointer})));
    }
  } else {
    if (!isEqual(lhs, rhs)) {
      if (lhs === undefined) {
        var parent = getParent(options.__originals.lhs, path);
        operations.push({
          op: 'add',
          path: path.replace(/\d+$/, (options.append && isArray(parent)) ? '-' : '$&'),
          value: rhs
        });
      } else if (rhs === undefined) {
        operations.push({
          op: 'remove',
          path: path
        });
      } else {
        operations.push({
          op: 'replace',
          path: path,
          value: rhs
        });
      }
    }
  }
  return operations;
}

module.exports = function (lhs, rhs, options) {
    opts = Object.assign(options || {}, {
        __originals: { lhs: lhs, rhs: rhs },
        depth: -1
    });
    opts.append = opts.append !== false;
    return _basicDiff(lhs, rhs, opts);
};
