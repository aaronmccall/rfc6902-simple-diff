require! chai
chai.should!
expect = chai.expect

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
      patches = differ.basic lhs, rhs
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
      patches = differ.basic lhs, rhs
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

  # refuse to follow Appendix A.2., A.4., A.7. and A.16.
  describe "examples in Appendix A." (_) ->
    it "1." ->
      patch = differ.diff({foo: \bar}, {baz: \qux foo: \bar}).0
      patch.op.should.equal \add
      patch.path.should.equal '/baz'
      patch.value.should.equal \qux
    #it "A.2." ->
    #  patch = differ.diff {foo: <[bar baz]>}, {foo: <[bar qux baz]>}
    #  console.log patch
    #  # will fail
    #  patch.should.have.length 1
    #  patch = patch.0
    #  patch.op.should.equal \add
    #  patch.path.should.equal '/foo/1'
    #  patch.value.should.equal \qux
    it "3." ->
      patch = differ.diff({baz: \qux foo: \bar}, {foo: \bar}).0
      patch.op.should.equal \remove
      patch.path.should.equal '/baz'
      expect(patch).not.to.have.property \value
    it "5." ->
      patch = differ.diff({baz: \qux foo: \bar}, {baz: \boo foo: \bar}).0
      patch.op.should.equal \replace
      patch.path.should.equal '/baz'
      patch.value.should.equal \boo
    it "6." ->
      patch = differ.diff do
        {foo: {bar: \baz waldo: \fred} qux: {corge: \grault}}
        {foo: {bar: \baz} qux: {corge: \grault thud: \fred}}
      patch .= 0
      patch.op.should.equal \move
      patch.from.should.equal '/foo/waldo'
      patch.path.should.equal '/qux/thud'
    it "10." ->
      patch = differ.diff do
        {foo: \bar}
        {foo: \bar child: grandchild: {}}
      patch .= 0
      patch.op.should.equal \add
      patch.path.should.equal '/child'
      patch.value.should.deep.equal grandchild: {}
