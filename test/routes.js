var routes = require('../routes'),
    assert = require('assert'),
    http = require('http');

describe("Router", function() {
  describe('GET /', function() {
    it('should respond successfully with HTML', function() {
      http.get({path: '/', port: 3000}, function(res) {
        assert(res.ok);
        done();
      });
    });
  });

  describe('POST /', function() {
    it('should redirect back from creating a new Card', function() {
      var postData = JSON.stringify({'card[summary]': 'SUMMARY', 'card[content]': 'CONTENT', 'card[status]': 'working'});
      var postReq = http.request({method: 'POST', path: '/', port: 3000}, function(res) {
        assert.equal(res.statusCode, 302);
        done();
      });
      postReq.write(postData);
      postReq.end();
    });
  });
});