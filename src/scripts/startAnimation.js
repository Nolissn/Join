/**
 * Skips the start animation when the login page is opened from another page of Join.
 * The animation is only shown when the page is opened for the first time or reloaded.
 */
function handleStartAnimation() {
  if (shouldSkipStartAnimation()) {
    document.documentElement.classList.add("start_animation_skipped");
  }
}


/**
 * Checks whether the start animation should be skipped.
 * @returns {boolean} True if the page was opened from another page of Join or by the browser history.
 */
function shouldSkipStartAnimation() {
  const navigationType = getNavigationType();
  if (navigationType === "reload") return false;
  if (navigationType === "back_forward") return true;
  return isInternalReferrer();
}


/**
 * Reads how the page was opened.
 * @returns {string} The navigation type, for example "navigate", "reload" or "back_forward".
 */
function getNavigationType() {
  const navigationEntry = performance.getEntriesByType("navigation")[0];
  return navigationEntry ? navigationEntry.type : "navigate";
}


/**
 * Checks whether the previous page belongs to Join.
 * @returns {boolean} True if the previous page has the same origin as the login page.
 */
function isInternalReferrer() {
  if (!document.referrer) return false;
  return new URL(document.referrer).origin === location.origin;
}


handleStartAnimation();
