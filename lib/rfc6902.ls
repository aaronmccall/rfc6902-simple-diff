_ = require \lodash

simple-diff = (lhs, rhs, path = '') ->
  result = []
  is-collection =
    l: _.isArray lhs or _.isPlainObject lhs
    r: _.isArray rhs or _.isPlainObject rhs
  if is-collection.l and is-collection.r
    keys = _.union Object.keys(lhs), Object.keys(rhs)
    for key in keys
      result .= concat simple-diff lhs[key], rhs[key], "#path/#key"
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
  result

# O(n^2)
diff = (lhs, rhs) ->
  result = simple-diff lhs, rhs
  cleanuped = []
  # should count by added, then i can deal with copy
  for removed in result when removed.op is \remove
    for added in result when added.op is \add
      if removed.path is added.path
        cleanuped.push do
          op:    \replace
          path:  added.path
          value: added.value
        removed.merged = added.merged = true
        break
      else if removed.value is added.value
        cleanuped.push do
          op:   \move
          from: removed.path
          path: added.path
        removed.merged = added.merged = true
        break
  for patch in result
    if not patch.merged
      if patch.op is \remove then delete patch.value
      cleanuped.push patch
  cleanuped

module.exports =
  simple-diff: simple-diff
  diff: diff
