const sessionTimeoutDuration = 30 * 60 * 1000;
const sessionWarningDuration = 2 * 60 * 1000;
const sessionGoodbyeDuration = 3000;
const sessionActivityEvents = ['pointerdown', 'pointermove', 'keydown', 'wheel', 'scroll'];
const sessionPassiveEvents = ['pointermove', 'wheel', 'scroll'];
let lastActivityTime = 0;
let sessionTimerId = null;
let isSessionWarningVisible = false;
let isSessionEnding = false;

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

function loadLastActivityTime() {
  try {
    const savedTime = Number(sessionStorage.getItem(lastActivityKey));
    if (savedTime > 0) return savedTime;
  } catch (error) {
    console.warn('Last activity could not be loaded:', error);
  }
  return Date.now();
}

function saveLastActivityTime() {
  if (isUserLoggedIn() === false) return;
  try {
    sessionStorage.setItem(lastActivityKey, String(lastActivityTime));
  } catch (error) {
    console.warn('Last activity could not be saved:', error);
  }
}

function handleSessionPageShow(event) {
  if (event.persisted === false) return;
  lastActivityTime = loadLastActivityTime();
  checkSessionTimeout();
}

function registerActivity(event) {
  if (isSessionEnding) return;
  if (isSessionWarningVisible && sessionPassiveEvents.includes(event.type)) return;
  lastActivityTime = Date.now();
  if (isSessionWarningVisible) checkSessionTimeout();
}

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

function showSessionWarning(remainingTime) {
  isSessionWarningVisible = true;
  document.getElementById('sessionWarningTime').textContent = getSessionWarningText(remainingTime);
  document.getElementById('sessionWarning').classList.add('sessionWarningVisible');
  document.getElementById('sessionOverlay').classList.add('sessionOverlayVisible');
}

function hideSessionWarning() {
  isSessionWarningVisible = false;
  document.getElementById('sessionWarning').classList.remove('sessionWarningVisible');
  document.getElementById('sessionOverlay').classList.remove('sessionOverlayVisible');
}

function getSessionWarningText(remainingTime) {
  const remainingSeconds = Math.ceil(remainingTime / 1000);
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  return minutes + ':' + String(seconds).padStart(2, '0');
}

function endSession() {
  isSessionEnding = true;
  clearInterval(sessionTimerId);
  hideSessionWarning();
  document.getElementById('sessionGoodbyeDialog').showModal();
  setTimeout(logOutAfterTimeout, sessionGoodbyeDuration);
}

function logOutAfterTimeout() {
  removeCurrentUser();
  location.replace('../../index.html');
}

document.addEventListener('DOMContentLoaded', initSessionTimeout);
