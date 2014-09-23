var _ = require('underscore');

function isObject(value) {
    var isObj = (typeof value === 'object') && (value !== null);
    return isObj;
}

var prevLhs, prevRhs;
function _basicDiff(lhs, rhs, options) {
  var result, keys, i$, key, append, path, pointer;
  options = options || {};
  append = options.append !== false;
  path = options.path;
  if (!path) path = '/';
  if (path.charAt(0) !== '/') path = '/' + path;
  result = [];
  if (isObject(lhs) && isObject(rhs)) {
    prevLhs = lhs;
    prevRhs = rhs;
    keys = _.union(_.keys(lhs), _.keys(rhs));
    i$ = -1;
    while ((key = keys[++i$])) {
      pointer = key.replace(/~/gi, '~0');
      pointer = pointer.replace(/\//gi, '~1');
      result = result.concat(_basicDiff(lhs[key], rhs[key], {path: ((path === '/') ? path : path + '/') + pointer, append: append}));
    }
  } else {
    if (!_.isEqual(lhs, rhs)) {
      if (lhs === undefined) {
        result.push({
          op: 'add',
          path: path.replace(/\d+$/, (append && _.isArray(prevLhs)) ? '-' : '$&'),
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