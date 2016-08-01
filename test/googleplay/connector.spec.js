var should = require('should');
var connector = require('../../googleplay/connector.js');

describe('googleplay/connector', function() {

  describe('#getReviews()', function() {

    it('should fetch reviews of an existing app', function(done) {
      connector.getReviews('com.facebook.katana', 'fr')
      .then(function(reviews) {
        reviews.should.be.instanceof(Array).and.have.lengthOf(40);
        done();
      }).fail(function(err) {
        done(err);
      });
    });

  });

  describe('#getAppInfo()', function() {

    it('should fetch app info of an existing app', function(done) {
      connector.getAppInfo('284882215')
      .then(function(appInfo) {
        should.exist(appInfo);
        appInfo.should.have.property('title');
        done();
      }).fail(function(err) {
        done();
      });
    });

  });

});
