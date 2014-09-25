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
var originalLhs, originalRhs;
function _basicDiff(lhs, rhs, options) {
  options = _.defaults(options || {}, { __originals: {} });
  if (!options.__originals.lhs) options.__originals.lhs = lhs;
  if (!options.__originals.rhs) options.__originals.rhs = rhs;
  var result, keys, i$, key, append, path, pointer;
  append = options.append !== false;
  path = options.path;
  if (!path) path = '/';
  if (path.charAt(0) !== '/') path = '/' + path;
  result = [];
  if (isObject(lhs) && isObject(rhs)) {
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
          path: path.replace(/\d+$/, (append && _.isArray(parent)) ? '-' : '$&'),
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

module.exports = _basicDiff;