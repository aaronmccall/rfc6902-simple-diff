var chai = require('chai');
chai.should();
var expect = chai.expect;
var diff = require('../');

describe('(Standalone) In RFC 6902,', function () {
  describe('path', function (_) {
    it('should start at "/" if no path in options', function () {
      var patch = diff({foo: 1}, null)[0];
      patch.op.should.equal('replace');
      patch.path.should.equal('/');
    });
    it('should start at "/" + options.path if path in options', function () {
      var patch = diff({foo: 1}, {foo: 2}, {path: 'biz'})[0];
      patch.op.should.equal('replace');
      patch.path.should.equal('/biz/foo');
    });
  });
  describe("add", function (_) {
    it("should happen when a new value has been added", function () {
      var patch = diff({}, {
        foo: {
          foo: 'bar'
        }
      })[0];
      patch.op.should.equal('add');
      patch.path.should.equal('/foo');
      patch.value.should.deep.equal({
        foo: 'bar'
      });
    });
    it('should have "-" as final node when append is not false', function () {
        var patch = diff({foo: [1]}, {foo: [1,2]})[0];

        patch.op.should.equal('add');
        patch.path.should.equal('/foo/-');
        patch.value.should.equal(2);
    });
    it('should have the index as final node when append is false', function () {
        var patch = diff({foo: [1]}, {foo: [1,2]}, {append: false})[0];
        patch.op.should.equal('add');
        patch.path.should.equal('/foo/1');
        patch.value.should.equal(2);
    });
  });
  describe("remove", function (_) {
    return it("should happen when a value has been removed", function () {
      var patch = diff({
        foo: {
          foo: 'bar'
        }
      }, {})[0];
      patch.op.should.equal('remove');
      patch.path.should.equal('/foo');
    });
  });
  describe("replace", function (_) {
    return it("should happen when a value has been replaced", function () {
      var patch = diff({
        foo: 'bar'
      }, {
        foo: 'foobar'
      })[0];
      patch.op.should.equal('replace');
      patch.path.should.equal('/foo');
      patch.value.should.equal('foobar');
    });
  });
  describe("even though NaN and Infinity are not part of JSON,", function (_) {
    it("NaN should be equal to NaN", function () {
      var patch = diff({
        foo: NaN
      }, {
        foo: NaN
      });
      patch.should.have.length(0);
    });
    return it("Infinity should be equal to Infinity", function () {
      var patch = diff({
        foo: Infinity
      }, {
        foo: Infinity
      });
      patch.should.have.length(0);
    });
  });

  describe("examples in Appendix A.", function (_) {
    it("1.", function () {
      var patch = diff({
        foo: 'bar'
      }, {
        baz: 'qux',
        foo: 'bar'
      })[0];
      patch.op.should.equal('add');
      patch.path.should.equal('/baz');
      patch.value.should.equal('qux');
    });
    it("3.", function () {
      var patch = diff({
        baz: 'qux',
        foo: 'bar'
      }, {
        foo: 'bar'
      })[0];
      patch.op.should.equal('remove');
      patch.path.should.equal('/baz');
      return expect(patch).not.to.have.property('value');
    });
    it("5.", function () {
      var patch = diff({
        baz: 'qux',
        foo: 'bar'
      }, {
        baz: 'boo',
        foo: 'bar'
      })[0];
      patch.op.should.equal('replace');
      patch.path.should.equal('/baz');
      patch.value.should.equal('boo');
    });
    it("10.", function () {
      var patch = diff({
        foo: 'bar'
      }, {
        foo: 'bar',
        child: {
          grandchild: {}
        }
      });
      patch = patch[0];
      patch.op.should.equal('add');
      patch.path.should.equal('/child');
      patch.value.should.deep.equal({
        grandchild: {}
      });
    });
  });

  describe('recursion depth', function () {
    it('is limited to 64 levels', function () {
      // Make a deeply nested JSON object representation
      // { "0": { "1": {… "63": { } …} } }
      var i = -1;
      var json = '{ ';
      while (++i < 64) {
        json += '"' + i + '": { ';
      }
      json += '} }';
      while (--i) {
        json += ' }';
      }
      // Up to 64 levels should not throw
      expect(function () {
        diff(JSON.parse(json), JSON.parse(json));
      }).not.to.throw();
      // But 65 should
      expect(function () {
        diff({ foo: JSON.parse(json) }, { foo: JSON.parse(json) });
      }).to.throw();
    });
  });
});
