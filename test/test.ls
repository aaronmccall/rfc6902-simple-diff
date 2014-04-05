require \chai .should!
differ = require '../lib/rfc6902'

describe 'In RFC 6902,' ->
  describe "add" (_) ->
    it "should happen when a new value has been added" ->
      patch = differ.diff({}, foo: foo: \bar).0
      patch.op.should.equal \add
      patch.path.should.equal '/foo'
      patch.value.should.deep.equal foo: \bar

  describe "remove" (_) ->
    it "should happen when a value has been removed" ->
      patch = differ.diff(foo: foo: \bar, {}).0
      patch.op.should.equal \remove
      patch.path.should.equal '/foo'

  describe "replace" (_) ->
    it "should happen when a value has been replaced" ->
      patch = differ.diff({foo: \bar}, {foo: \foobar}).0
      patch.op.should.equal \replace
      patch.path.should.equal '/foo'
      patch.value.should.equal \foobar

  describe "move" (_) ->
    lhs = foo: \bar bar: {}
    rhs = bar: foo: \bar
    it "should not happen in simple diff" ->
      patches = differ.simple-diff lhs, rhs
      for patch in patches
        patch.op.should.not.equal \move
    it "should happen when a value has been moved" ->
      patch = differ.diff(lhs, rhs).0
      patch.op.should.equal \move
      patch.from.should.equal '/foo'
      patch.path.should.equal '/bar/foo'

  describe "copy" (_) ->
    lhs = foo: \bar bar: {}
    rhs = foo: \bar bar: foo: \bar
    it "should not happen in simple diff" ->
      patches = differ.simple-diff lhs, rhs
      for patch in patches
        patch.op.should.not.equal \copy
    it "should happen when a value has been copied" ->
      patch = differ.diff(lhs, rhs).0
      patch.op.should.equal \copy
      patch.from.should.equal '/foo'
      patch.path.should.equal '/bar/foo'

  # well, NaN and Infinity should not be equal to themselves in Math
  describe "even NaN and Infinity are not part of JSON," (_) ->
    it "NaN should be equal to NaN" ->
      patch = differ.diff({foo: NaN}, {foo: NaN})
      patch.should.have.length 0
    it "Infinity should be equal to Infinity" ->
      patch = differ.diff({foo: Infinity}, {foo: Infinity})
      patch.should.have.length 0

  describe "path should follow RFC 6901," (_) ->
    lhs = '~foo~': \bar
    rhs = '/foo/': \bar
    patch = differ.diff(lhs, rhs).0
    it "~ should become ~0" ->
      patch.from.should.be.equal '/~0foo~0'
    it "/ should become ~1" ->
      patch.path.should.be.equal '/~1foo~1'

