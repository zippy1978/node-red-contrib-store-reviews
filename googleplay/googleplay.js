module.exports = function(RED) {
  "use strict";

  var storeScraper = require('google-play-scraper');
  var Q = require('q');
  var url = require('url');

  function GooglePlayNode(config) {

      RED.nodes.createNode(this,config);
      this.appid = config.appid;
      // Parse multiple app ids
      this.appids = this.appid.split(' ');
      this.language = config.language;
      this.pollinginterval = config.pollinginterval;
      var context = this.context();
      var node = this;

      context.set('latestReviewUrls', {});

      function retrieveReviews() {

        node.appids.forEach(function(appid) {

          node.log('Retrieving reviews for App ' + appid);

          storeScraper.reviews({
            appId: appid,
            lang: node.language,
            page: 0,
            sort: storeScraper.sort.NEWEST
          }).then(function(reviews) {

            // Store first (latest) review URL
            var startReviewUrl = null;
            var appid = null;
            if (reviews.length > 0) {
              startReviewUrl = reviews[0].url;
              // Parse matching app id from URL
              appid = url.parse(reviews[0].url, true).query.id;
            }

            // Send message for each new review
            var latestReviewUrls = context.get('latestReviewUrls');
            var latestReviewReached = (latestReviewUrls[appid] === undefined);
            var i = 0;
            var newReviewsCount = 0;

            while (!latestReviewReached && i < reviews.length) {
              var review = reviews[i];

              if (latestReviewUrls[appid] === review.url) {
                latestReviewReached = true;
              } else {
                // Send new review
                var msg = {payload: appid + ' - ' + review.title + ' ' + review.score};
                msg.review = review;
                // Add extra application information into the review
                var appInfo = context.get('appsInfo')[appid];
                msg.review.app = {
                  id: appInfo.appId,
                  title: appInfo.title,
                  icon: appInfo.icon,
                  url: appInfo.url
                };
                node.send(msg);
                newReviewsCount++;
              }
              i++;
            }

            node.log('Found ' + newReviewsCount + ' new reviews for App ' + appid);

            // Store last review URL processed
            if (startReviewUrl !== null) {
              latestReviewUrls[appid] = startReviewUrl;
            }

          }).catch(function(e) {
            node.error('Failed to retrieve App reviews: ' + e.message);
          });

        });

      }

      function retrieveAppInfo() {

        var promises = [];
        node.appids.forEach(function(appid) {
          promises.push(storeScraper.app({appId: appid}));
        });

        return Q.all(promises).
        then(function(results) {
          var appsInfo = {};
          context.set('appsInfo',appsInfo);
          // Store app info of each app in the node context
          results.forEach(function(appInfo) {
            appsInfo[appInfo.appId] = appInfo;
          });
        });

      }

      // Reteive app information and start polling
      var interval = null;
      retrieveAppInfo().
      then(function(appInfo) {

        // Interval to poll the reviews
        interval = setInterval(function() {
          retrieveReviews();
        }, (node.pollinginterval) * 60 * 1000);
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

  RED.nodes.registerType("googleplay",GooglePlayNode);
};
