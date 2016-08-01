"user strict";

var interval;

module.exports = {

  start: function(task, minutes) {
    interval = setInterval(function() {
      task();
    }, minutes * 60 * 1000);
  },

  stop: function() {
    clearInterval(interval);
  }
};
