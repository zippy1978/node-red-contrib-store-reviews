module.exports = function(RED) {
  "use strict";

  var storeScraper = require('app-store-scraper');
  var AppStoreReviewsModule = require('app-store-reviews');
  var appStoreReviews = new AppStoreReviewsModule();

  function AppStoreNode(config) {

      RED.nodes.createNode(this,config);
      this.appid = config.appid;
      this.country = config.country;
      this.pollinginterval = config.pollinginterval;
      var context = this.context();
      var node = this;

      // Send a new message for each new review
      appStoreReviews.on('review', function(review) {

        if (context.get('latestReviewId') === undefined) {
          context.set('latestReviewId',review.id);
        } else if (review.id > context.get('latestReviewId')) {
          context.set('latestReviewId',review.id);
          var msg = {payload: null};
          msg.review = review;
          // Add extra application information into the review
          var appInfo = context.get('appInfo');
          msg.review.app = {
            id: appInfo.id,
            title: appInfo.title,
            icon: appInfo.icon,
            url: appInfo.url
          };
          node.send(msg);
        }

      });

      var retrieveReviews = function() {

        node.log('Retrieving reviews');

        appStoreReviews.getReviews(node.appid, node.country, 1);
      };

      // Retrieve app information and setup polling
      var interval = null;
      storeScraper.app({id: node.appid}).
      then(function(appInfo) {

        context.set('appInfo',appInfo);

        // Interval to poll the reviews
        interval = setInterval(function() {
          retrieveReviews();
        }, parseInt(node.pollinginterval) * 60 * 1000);
        // Initial retrieval
        retrieveReviews();

        node.log('Running (' + appInfo.title + ')');

      }).catch(function(e) {
        node.error('Failed to retrieve App info', e.message);
      });

      // On node destruction...
      node.on('close', function(done) {
        if (interval !== null) {
          clearInterval(interval);
        }
        done();
      });
  }

  RED.nodes.registerType("appstore",AppStoreNode);
}
