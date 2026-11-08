const sessionTimeoutDuration = 30 * 60 * 1000;
const sessionWarningDuration = 2 * 60 * 1000;
const sessionGoodbyeDuration = 3000;
const sessionActivityEvents = ['pointerdown', 'pointermove', 'keydown', 'wheel', 'scroll'];
const sessionPassiveEvents = ['pointermove', 'wheel', 'scroll'];
let lastActivityTime = 0;
let sessionTimerId = null;
let isSessionWarningVisible = false;
let isSessionEnding = false;

/**
 * Starts the session timeout for the logged-in user.
 * Inserts the warning markup, registers the activity listeners and starts the timer.
 */
function initSessionTimeout() {
  if (isUserLoggedIn() === false) return;
  lastActivityTime = loadLastActivityTime();
  document.body.insertAdjacentHTML('beforeend', sessionTimeoutTemplate(iconPath));
  for (const eventName of sessionActivityEvents) {
    document.addEventListener(eventName, registerActivity, { capture: true, passive: true });
  }
  window.addEventListener('pagehide', saveLastActivityTime);
  window.addEventListener('pageshow', handleSessionPageShow);
  sessionTimerId = setInterval(checkSessionTimeout, 1000);
  checkSessionTimeout();
}

/**
 * Loads the time of the last user activity from the session storage.
 * @returns {number} The saved timestamp in milliseconds, or the current time if none is saved.
 */
function loadLastActivityTime() {
  try {
    const savedTime = Number(sessionStorage.getItem(lastActivityKey));
    if (savedTime > 0) return savedTime;
  } catch (error) {
    console.warn('Last activity could not be loaded:', error);
  }
  return Date.now();
}

/**
 * Saves the time of the last user activity in the session storage.
 */
function saveLastActivityTime() {
  if (isUserLoggedIn() === false) return;
  try {
    sessionStorage.setItem(lastActivityKey, String(lastActivityTime));
  } catch (error) {
    console.warn('Last activity could not be saved:', error);
  }
}

/**
 * Reloads the last activity time and checks the timeout when the page is restored from the browser cache.
 * @param {PageTransitionEvent} event - The pageshow event.
 */
function handleSessionPageShow(event) {
  if (event.persisted === false) return;
  lastActivityTime = loadLastActivityTime();
  checkSessionTimeout();
}

/**
 * Registers a user activity and resets the timeout.
 * While the warning is visible, only active input like clicks or key presses counts as activity.
 * @param {Event} event - The activity event.
 */
function registerActivity(event) {
  if (isSessionEnding) return;
  if (isSessionWarningVisible && sessionPassiveEvents.includes(event.type)) return;
  lastActivityTime = Date.now();
  if (isSessionWarningVisible) checkSessionTimeout();
}

/**
 * Checks the remaining session time and shows the warning, hides it or ends the session.
 */
function checkSessionTimeout() {
  if (isSessionEnding) return;
  saveLastActivityTime();
  const remainingTime = lastActivityTime + sessionTimeoutDuration - Date.now();
  if (remainingTime <= 0) {
    endSession();
  } else if (remainingTime <= sessionWarningDuration) {
    showSessionWarning(remainingTime);
  } else {
    hideSessionWarning();
  }
}

/**
 * Shows the timeout warning with the remaining time.
 * @param {number} remainingTime - The remaining session time in milliseconds.
 */
function showSessionWarning(remainingTime) {
  isSessionWarningVisible = true;
  document.getElementById('sessionWarningTime').textContent = getSessionWarningText(remainingTime);
  document.getElementById('sessionWarning').classList.add('sessionWarningVisible');
  document.getElementById('sessionOverlay').classList.add('sessionOverlayVisible');
}

/**
 * Hides the timeout warning.
 */
function hideSessionWarning() {
  isSessionWarningVisible = false;
  document.getElementById('sessionWarning').classList.remove('sessionWarningVisible');
  document.getElementById('sessionOverlay').classList.remove('sessionOverlayVisible');
}

/**
 * Formats the remaining session time as minutes and seconds.
 * @param {number} remainingTime - The remaining session time in milliseconds.
 * @returns {string} The time in the format m:ss.
 */
function getSessionWarningText(remainingTime) {
  const remainingSeconds = Math.ceil(remainingTime / 1000);
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  return minutes + ':' + String(seconds).padStart(2, '0');
}

/**
 * Ends the session, shows the goodbye dialog and logs out after a short delay.
 */
function endSession() {
  isSessionEnding = true;
  clearInterval(sessionTimerId);
  hideSessionWarning();
  document.getElementById('sessionGoodbyeDialog').showModal();
  setTimeout(logOutAfterTimeout, sessionGoodbyeDuration);
}

/**
 * Logs out the user and redirects to the login page.
 */
function logOutAfterTimeout() {
  removeCurrentUser();
  location.replace('../../index.html');
}

document.addEventListener('DOMContentLoaded', initSessionTimeout);
