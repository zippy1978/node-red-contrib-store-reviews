module.exports = function(RED) {
  "use strict";

  var storeScraper = require('app-store-scraper');
  var AppStoreReviewsModule = require('app-store-reviews');
  var Q = require('q');
  var appStoreReviews = new AppStoreReviewsModule();


  function AppStoreNode(config) {

      RED.nodes.createNode(this,config);
      this.appid = config.appid;
      // Parse multiple app ids
      this.appids = this.appid.split(' ');
      this.country = config.country;
      this.pollinginterval = config.pollinginterval;
      var context = this.context();
      var node = this;

      context.set('latestReviewIds',{});

      // Send a new message for each new review
      appStoreReviews.on('review', function(review) {

        var latestReviewIds = context.get('latestReviewIds');

        if (latestReviewIds[review.app] === undefined) {
          // First review : will be used as start value
          latestReviewIds[review.app] = review.id;
        } else if (review.id > latestReviewIds[review.app]) {
          // New review
          latestReviewIds[review.app] = review.id;
          var msg = {payload: review.app + ' - ' + review.title + ' - ' + review.rate};
          msg.review = review;
          // Add extra application information into the review
          var appInfo = context.get('appsInfo')[review.app];
          msg.review.app = {
            id: appInfo.id,
            title: appInfo.title,
            icon: appInfo.icon,
            url: appInfo.url
          };
          node.send(msg);
        }

      });

      function retrieveReviews() {

        node.appids.forEach(function(appid) {
          node.log('Retrieving reviews for App ' + appid);
          appStoreReviews.getReviews(appid, node.country, 1);
        });
      }

      function retrieveAppInfo() {

        var promises = [];
        node.appids.forEach(function(appid) {
          promises.push(storeScraper.app({id: appid}))
        });

        return Q.all(promises).
        then(function(results) {
          var appsInfo = {};
          context.set('appsInfo',appsInfo);
          // Store app info of each app in the node context
          results.forEach(function(appInfo) {
            appsInfo[appInfo.id] = appInfo;
          });
        });

      }

      // Retrieve app information and setup polling
      var interval = null;
      retrieveAppInfo().
      then(function(appInfo) {

        // Interval to poll the reviews
        interval = setInterval(function() {
          retrieveReviews();
        }, parseInt(node.pollinginterval) * 60 * 1000);
        // Initial retrieval
        retrieveReviews();

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
