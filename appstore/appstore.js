module.exports = function(RED) {
  "use strict";

  var poller = require('../lib/poller.js');
  var Detector = require('../lib/detector.js');
  var connector = require('./connector.js');


  function AppStoreNode(config) {

      RED.nodes.createNode(this,config);

      // Parse multiple app ids
      this.appids = config.appid.split(' ');
      this.country = config.country;
      this.pollinginterval = config.pollinginterval;

      var context = this.context();
      var node = this;

      // Instantiate detector for each application
      node.appids.forEach(function(a) {
        node.log('Registering app ' + a);
        context.set(a, new Detector(a, node.country, connector));
      });

      // Start polling
      poller.start(function() {

        // Detect new reviews for each application
        node.appids.forEach(function(a) {
          var detector = context.get(a);

          node.log('Looking for new reviews for app ' + a);

          detector.detect()
          .then(function(newReviews) {

            node.log(newReviews.length + ' new reviews found for app ' + detector.appId);

            // Send new reviews
            newReviews.forEach(function(r) {
              var msg = {payload: r.id + ' - ' + r.title + ' - ' + r.rating};
              msg.review = r;
              node.send(msg);
            });

          }).fail(function(err) {
            node.error('Failed to detect new reviews for ' + a);
          });
        });

      }, parseInt(node.pollinginterval));

      // On node destruction...
      node.on('close', function(done) {
        if (interval !== null) {
         poller.stop();
        }
        done();
      });
  }

  RED.nodes.registerType("appstore",AppStoreNode);

};
