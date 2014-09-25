var _ = require('underscore');

function isObject(value) {
    var isObj = (typeof value === 'object') && (value !== null);
    return isObj;
}

function getParent(current, path) {
    path = path.slice(1).split('/').slice(0, -1);
    var i = -1;
    var prop;
    while ((prop = path[++i])) {
        current = current[prop];
        if (typeof current == null) return current;
    }
    return current;
}
var depth = 0;
function _basicDiff(lhs, rhs, options) {
  var result, keys, i$, key, append, path, pointer;
  path = options.path;
  if (!path) path = '/';
  if (path.charAt(0) !== '/') path = '/' + path;

  result = [];
  if (isObject(lhs) && isObject(rhs)) {
    options.depth += 1;
    if (options.depth > 64) {
      throw new Error('Object depth exceeded 64 nested objects.');
    }
    keys = _.union(_.keys(lhs), _.keys(rhs));
    i$ = -1;
    while ((key = keys[++i$])) {
      pointer = key.replace(/~/gi, '~0');
      pointer = pointer.replace(/\//gi, '~1');
      result = result.concat(_basicDiff(lhs[key], rhs[key], _.extend(options, {path: ((path === '/') ? path : path + '/') + pointer})));
    }
  } else {
    if (!_.isEqual(lhs, rhs)) {
      if (lhs === undefined) {
        var parent = getParent(options.__originals.lhs, path);
        result.push({
          op: 'add',
          path: path.replace(/\d+$/, (options.append && _.isArray(parent)) ? '-' : '$&'),
          value: rhs
        });
      } else if (rhs === undefined) {
        result.push({
          op: 'remove',
          path: path
        });
      } else {
        result.push({
          op: 'replace',
          path: path,
          value: rhs
        });
      }
    }
  }
  return result;
}

module.exports = function (lhs, rhs, options) {
    options = _.defaults({
        __originals: {
            lhs: lhs,
            rhs: rhs
        },
        depth: -1
    }, options || {});
    options.append = options.append !== false;
    return _basicDiff(lhs, rhs, options);
};
