"user strict";
var Q = require('q');
var storeScraper = require('google-play-scraper');
var url = require('url');

function getReviews(appId, country, page) {

  var deferred = Q.defer();
  storeScraper.reviews({
    appId: appId,
    lang: country,
    page: page,
    sort: storeScraper.sort.NEWEST
  }).then(function(reviews) {
    var formattedReviews = [];

    reviews.forEach(function(r) {
      formattedReviews.push(formatReview(r));
    });

    deferred.resolve(formattedReviews);

  }).catch(function(err) {
    deferred.reject(new Error(err));
  });

  return deferred.promise;
}

function getAppInfo(appId) {

  var deferred = Q.defer();
  storeScraper.app({appId: appId}).then(function(app) {
    deferred.resolve(formatAppInfo(app));
  }).catch(function(err) {
    deferred.reject(new Error(err));
  });

  return deferred.promise;

}

function formatReview(rawReview) {

  var id = url.parse(rawReview.url, true).query.reviewId;

  return {
    id: id,
    author: rawReview.userName,
    rating: rawReview.score,
    title: rawReview.title,
    comment: rawReview.text
  };
}

function formatAppInfo(rawAppInfo) {
  return {
    id: rawAppInfo.appId,
    title: rawAppInfo.title,
    icon: rawAppInfo.icon,
    url: rawAppInfo.url
  };
}

module.exports = {

  getReviews: function(appId, country) {
    return getReviews(appId, country, 0);
  },

  getAppInfo: function(appId) {
    return getAppInfo(appId);
  }
};
