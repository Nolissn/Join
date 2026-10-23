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
