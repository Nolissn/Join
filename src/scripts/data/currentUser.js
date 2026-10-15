const currentUserKey = 'joinCurrentUser';
let currentUser = loadCurrentUser();

function loadCurrentUser() {
  try {
    const savedText = sessionStorage.getItem(currentUserKey);
    if (savedText === null) return null;
    return JSON.parse(savedText);
  } catch (error) {
    console.warn('Current user could not be loaded:', error);
    return null;
  }
}

function setCurrentUser(user) {
  currentUser = { id: user.id, name: user.name, email: user.email };
  try {
    sessionStorage.setItem(currentUserKey, JSON.stringify(currentUser));
  } catch (error) {
    console.warn('Current user could not be saved:', error);
  }
}

function removeCurrentUser() {
  currentUser = null;
  try {
    sessionStorage.removeItem(currentUserKey);
  } catch (error) {
    console.warn('Current user could not be removed:', error);
  }
}
