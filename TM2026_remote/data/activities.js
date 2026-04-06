// Default activity list source (read-only).
// The actual default data is seeded from `activity-pages.js` on page load.
(function () {
  window.DEFAULT_ACTIVITIES = window.activityPages?.activities || [];
})();

