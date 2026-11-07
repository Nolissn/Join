const currentUserKey = 'joinCurrentUser';
const lastActivityKey = 'joinLastActivity';
const summaryGreetingIntroKey = 'joinSummaryGreetingIntro';
const contactsKey = 'joinContacts';
const tasksKey = 'joinTasks';
const tasksOutdatedKey = 'joinTasksOutdated';
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

function setCurrentUser(user, isGuest = false) {
  removeCachedUserData();
  currentUser = { id: user.id, name: user.name, email: user.email, isGuest };
  try {
    sessionStorage.setItem(currentUserKey, JSON.stringify(currentUser));
    sessionStorage.setItem(summaryGreetingIntroKey, 'true');
  } catch (error) {
    console.warn('Current user could not be saved:', error);
  }
}

function consumeSummaryGreetingIntro() {
  try {
    const shouldShowIntro = sessionStorage.getItem(summaryGreetingIntroKey) === 'true';
    sessionStorage.removeItem(summaryGreetingIntroKey);
    return shouldShowIntro;
  } catch (error) {
    console.warn('Summary greeting intro could not be loaded:', error);
    return false;
  }
}

function removeCurrentUser() {
  currentUser = null;
  try {
    sessionStorage.removeItem(currentUserKey);
    sessionStorage.removeItem(lastActivityKey);
    sessionStorage.removeItem(summaryGreetingIntroKey);
  } catch (error) {
    console.warn('Current user could not be removed:', error);
  }
  removeCachedUserData();
}

function removeCachedUserData() {
  try {
    sessionStorage.removeItem(tasksKey);
    sessionStorage.removeItem(tasksOutdatedKey);
    sessionStorage.removeItem(contactsKey);
  } catch (error) {
    console.warn('Cached user data could not be removed:', error);
  }
}

function isUserLoggedIn() {
  if (currentUser === null) return false;
  if (!currentUser.id || !currentUser.name) return false;
  return true;
}
