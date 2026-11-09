/**
 * Redirects to the login page if no user is logged in.
 */
function guardPage() {
  if (isUserLoggedIn() === false) {
    location.replace('../../index.html');
  }
}


/**
 * Checks the login again when the page is restored from the browser cache.
 * @param {PageTransitionEvent} event - The pageshow event.
 */
function handlePageShow(event) {
  if (event.persisted) {
    currentUser = loadCurrentUser();
    guardPage();
  }
}

guardPage();
window.addEventListener('pageshow', handlePageShow);
