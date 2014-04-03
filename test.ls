differ = require './lib/rfc6902'

lhs =
  a: \a
  b: \b
  c: \c
  d: \d
  '3': \foo

rhs = <[a b c bar foobar]>

console.log differ.diff lhs, rhs
