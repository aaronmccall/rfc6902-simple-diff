function getClassID(obj) {
  return Object.prototype.toString.call(obj)
}

function isArray(value) {
  return getClassID(value).match(/object Array/)
}

function isObject(value) {
  return getClassID(value).match(/object Object/)
}

function isArrayOrObject(value) {
  return isObject(value) || isArray(value)
}

function isEqual(left, right) {
  // Same primitive or same referent
  if (left === right) return true
  // Both are NaN
  if ((left !== left) && (right !== right)) return true
  var lClassID = getClassID(left)
  // If left and right aren't the same type
  if (lClassID !== getClassID(right)) return false
  // For Date, compare int timestamp values
  if (lClassID.match(/object Date/)) {
    return +left === +right
  }
  // For Regexp, compare string values
  if (lClassID.match(/object RegExp/)) {
    return left.toString() === right.toString()
  }
  // Array
  if (isArray(left)) {
    if (left.length !== right.length) return false
    for (var i=0, l=left.length; i<l; i++) {
      if (!isEqual(left[i], right[i])) return false
    }
    return true
  }
  // Object
  if (isObject(left)) {
    var keys = Object.keys(left)
    if (keys.length !== Object.keys(right).length) return false
    for (var i=0, l=keys.length, key=keys[i]; i<l; i++) {
      if (!Object.prototype.hasOwnProperty.call(right, key)) return false
      if (!equal(left[key], right[key])) return false
    }
    return true
  }
  return false
}

function preparePath(pathString) {
  if (!pathString) return '/'
  if (pathString.charAt(0) !== '/') return `/${pathString}`
  return pathString
}

function unionKeys(left, right) {
  var keys = Object.keys(left)
  Object.keys(right).forEach(key => keys.indexOf(key) === -1 && keys.push(key))
  return keys
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
    var keys = unionKeys(lhs, rhs)
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
        __originals: {
            lhs: lhs,
            rhs: rhs
        },
        depth: -1
    });
    opts.append = opts.append !== false;
    return _basicDiff(lhs, rhs, opts);
};
