_ = require \lodash

_simple-diff = (lhs, rhs, path = '') ->
  result = []
  is-collection =
    l: _.isArray lhs or _.isPlainObject lhs
    r: _.isArray rhs or _.isPlainObject rhs
  if is-collection.l and is-collection.r
    keys = _.union Object.keys(lhs), Object.keys(rhs)
    for key in keys
      result .= concat _simple-diff lhs[key], rhs[key], "#path/#key"
  else
    if not (_.isNaN lhs and _.isNaN rhs) and lhs isnt rhs
      if lhs is undefined
        result.push do
          op:    \add
          path:  path
          value: rhs
      else if rhs is undefined
        result.push do
          op:    \remove
          path:  path
          value: lhs
      else
        result.push do
          op:    \replace
          path:  path
          value: rhs
    else
      result.push do
        op:    \nop
        path:  path
        value: lhs
  result

_cleanup = ->
  for patch in it when patch.op isnt \nop and not patch.merged
    if patch.op is \remove then delete patch.value
    patch

# O(n^2)
diff = (lhs, rhs) ->
  d = _simple-diff lhs, rhs
  result = []
  # should count by added, then i can deal with copy
  for added in d when added.op is \add
    for patch in d when patch isnt added
      if patch.op is \remove
        if patch.path is added.path
          result.push do
            op:    \replace
            path:  added.path
            value: added.value
          patch.merged = added.merged = true
          break
        else if patch.value is added.value
          result.push do
            op:   \move
            from: patch.path
            path: added.path
          patch.merged = added.merged = true
          break
      else if patch.op is \nop and patch.value is added.value
        result.push do
          op: \copy
          from: patch.path
          path: added.path
        added.merged = true
  result.concat _cleanup d

module.exports =
  simple-diff: (lhs, rhs) -> _cleanup _simple-diff lhs, rhs
  diff: diff
