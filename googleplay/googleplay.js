module.exports = function(RED) {
  "use strict";

  var storeScraper = require('google-play-scraper');

  function GooglePlayNode(config) {

      RED.nodes.createNode(this,config);
      this.appid = config.appid;
      this.language = config.language;
      this.pollinginterval = config.pollinginterval;
      var context = this.context();
      var node = this;

      var retrieveReviews = function() {

        node.log('Retrieving reviews');

        storeScraper.reviews({
          appId: node.appid,
          lang: node.language,
          page: 0
        }).then(function(reviews) {

          // Store first (latest) review URL
          var startReviewUrl = null;
          if (reviews.length > 0) {
            startReviewUrl = reviews[0].url;
          }

          // Send message for each new review
          var latestReviewReached = (context.get('latestReviewUrl') === undefined);
          var i = 0;
          var latestReviewUrl = context.get('latestReviewUrl');
          while (!latestReviewReached && i < reviews.length) {
            var review = reviews[i];

            if (latestReviewUrl === review.url) {
                latestReviewReached = true;
            } else {
              // Send new review
              var msg = {payload: null};
              msg.review = review;
              // Add extra application information into the review
              var appInfo = context.get('appInfo');
              msg.review.app = {
                id: appInfo.appId,
                title: appInfo.title,
                icon: appInfo.icon,
                url: appInfo.url
              };
              node.send(msg);
            }
            i++;
          }

          // Store last review UL processed
          if (startReviewUrl !== null) {
            context.set('latestReviewUrl',startReviewUrl);
          }

        }).catch(function(e) {
          node.error('Failed to retrieve App reviews', e.message);
        });

      };

      // Reteive app information and start polling
      var interval = null;
      storeScraper.app({appId: node.appid}).
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

  RED.nodes.registerType("googleplay",GooglePlayNode);
}
