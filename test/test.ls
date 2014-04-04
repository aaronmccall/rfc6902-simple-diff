require \chai .should!
differ = require '../lib/rfc6902'

describe 'In RFC-6902,' ->
  describe "add" (_) ->
    it "should happen when a new value has been added" ->
      patch = differ.diff({}, {foo: \bar}).0
      patch.op.should.equal \add
      patch.path.should.equal '/foo'
      patch.value.should.equal \bar
