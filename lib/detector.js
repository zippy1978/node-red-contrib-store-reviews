"use strict";
var Q = require('q');

module.exports = function(appId, country, connector) {

  var self = this;

  this.appId = appId;
  this.country = country;
  this.connector = connector;
  this.appInfo = null;
  this.latestReviewId = null;

  this.detect = function() {

    // Get application info
    return self.connector.getAppInfo(self.appId)
    .then(function(appInfo) {
      self.appInfo = appInfo;

      // Get reviews
      return self.connector.getReviews(self.appId, self.country)
      .then(function(reviews) {

        var startReviewId = null;
        if (reviews.length > 0) {
          startReviewId = reviews[0].id;
        }

        var latestReviewReached = (self.latestReviewId === null);

        var newReviews = [];

        // Iterate reviews
        var i = 0;
        while (!latestReviewReached && i < reviews.length) {

          var review = reviews[i];

          if (self.latestReviewId === review.id) {
            latestReviewReached = true;
          } else {

            // This is a new review
            // Add appInfo
            review.appInfo = self.appInfo;
            newReviews.push(review);

          }
          i++;
        }

        // Mark start review id as processed
        if (startReviewId !== null) {
          self.latestReviewId = startReviewId;
        }

        return Q.fcall(function() {
          return newReviews;
        });

      });

    });
  };

};
