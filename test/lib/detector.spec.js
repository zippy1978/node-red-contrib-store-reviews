var should = require('should');
var Detector = require('../../lib/detector.js');
var Q = require('q');

var initialMockConnector = {
  getReviews: function(appId, country) {
    return Q.fcall(function() {
      return [{id: 2,
        author: 'a',
        rating: 3,
        title: 't',
        comment: 'c'},
        {id: 1,
          author: 'a',
          rating: 2,
          title: 't',
          comment: 'c'}
      ];
    });
  },

  getAppInfo: function(appId) {
    return Q.fcall(function() {
      return {
        id: '123',
        title: 't',
        icon: 'i',
        url: 'http://fake'
      };
    });
  }
};

var newReviewMockConnector = {
  getReviews: function(appId, country) {
    return Q.fcall(function() {
      return [{id: 3,
        author: 'a',
        rating: 2,
        title: 't',
        comment: 'c'},
        {id: 2,
        author: 'a',
        rating: 3,
        title: 't',
        comment: 'c'},
        {id: 1,
          author: 'a',
          rating: 2,
          title: 't',
          comment: 'c'}
      ];
    });
  },

  getAppInfo: function(appId) {
    return Q.fcall(function() {
      return {
        id: '123',
        title: 't',
        icon: 'i',
        url: 'http://fake'
      };
    });
  }
};

describe('detector', function() {

  describe('#detect()', function() {

    it('should no detect reviews on first use', function(done) {

      var detector = new Detector('appId', 'country', initialMockConnector);

      detector.detect()
      .then(function(newReviews) {
        newReviews.should.be.instanceof(Array).and.have.lengthOf(0);
        done();
      }).fail(function(err) {
        done(err);
      });

    });

    it('should no detect reviews on first and second use if no new review', function(done) {

      var detector = new Detector('appId', 'country', initialMockConnector);

      detector.detect()
      .then(function(newReviews) {

        detector.detect()
        .then(function(newReviews) {
          newReviews.should.be.instanceof(Array).and.have.lengthOf(0);
          done();
        }).fail(function(err) {
          done(err);
        });

      }).fail(function(err) {
        done(err);
      });

    });

    it('should detect new reviews', function(done) {

      var detector = new Detector('appId', 'country', initialMockConnector);

      detector.detect()
      .then(function(newReviews) {

        detector.connector = newReviewMockConnector;

        detector.detect()
        .then(function(newReviews) {
          newReviews.should.be.instanceof(Array).and.have.lengthOf(1);
          newReviews[0].should.have.property('id', 3);
          done();
        }).fail(function(err) {
          done(err);
        });

      }).fail(function(err) {
        done(err);
      });

    });


  });

});
