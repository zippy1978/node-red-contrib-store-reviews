var should = require('should');
var connector = require('../../appstore/connector.js');

describe('appstore/connector', function() {

  describe('#getReviews()', function() {

    it('should fetch reviews of an existing app', function(done) {
      connector.getReviews('284882215', 'fr')
      .then(function(reviews) {
        reviews.should.be.instanceof(Array).and.have.lengthOf(50);
        done();
      }).fail(function(err) {
        done(err);
      });
    });

    it('should raise an error when fetching reviews of a non-existing app', function(done) {
      connector.getReviews('FAKE', 'fr')
      .then(function(reviews) {
        done(new Error('should not return reviews'));
      }).fail(function(err) {
        done();
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
