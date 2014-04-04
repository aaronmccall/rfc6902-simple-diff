differ = require './lib/rfc6902'

lhs =
  a: \a
  b: \b
  c: \c
  d: \d
  '3': \foo
  '4': \foobar

rhs = <[a b c bar foobar foobar]>

console.log differ.simple-diff lhs, rhs
console.log differ.diff lhs, rhs
