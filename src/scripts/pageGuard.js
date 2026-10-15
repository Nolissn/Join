function isUserLoggedIn() {
  if (currentUser === null) return false;
  if (!currentUser.id || !currentUser.name) return false;
  return true;
}

function guardPage() {
  if (isUserLoggedIn() === false) {
    location.replace('../../index.html');
  }
}

function handlePageShow(event) {
  if (event.persisted) {
    currentUser = loadCurrentUser();
    guardPage();
  }
}

guardPage();
window.addEventListener('pageshow', handlePageShow);
