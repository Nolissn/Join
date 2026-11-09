const currentUserKey = 'joinCurrentUser';
const lastActivityKey = 'joinLastActivity';
const summaryGreetingIntroKey = 'joinSummaryGreetingIntro';
const contactsKey = 'joinContacts';
const tasksKey = 'joinTasks';
const tasksOutdatedKey = 'joinTasksOutdated';
let currentUser = loadCurrentUser();


/**
 * Loads the logged-in user from the session storage.
 * @returns {Object|null} The saved user, or null if no user is saved or loading fails.
 */
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


/**
 * Sets the logged-in user, saves it in the session storage and removes the cached data of the previous user.
 * @param {Object} user - The user who logs in.
 * @param {string} user.id - The id of the user.
 * @param {string} user.name - The name of the user.
 * @param {string} user.email - The email of the user.
 * @param {boolean} [isGuest=false] - Whether the user is logged in as guest.
 */
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


/**
 * Checks whether the greeting intro on the summary page should be shown and removes the flag, so it is shown only once.
 * @returns {boolean} True if the intro should be shown.
 */
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


/**
 * Logs out the current user and removes all user data from the session storage.
 */
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


/**
 * Removes the cached tasks and contacts from the session storage.
 */
function removeCachedUserData() {
  try {
    sessionStorage.removeItem(tasksKey);
    sessionStorage.removeItem(tasksOutdatedKey);
    sessionStorage.removeItem(contactsKey);
  } catch (error) {
    console.warn('Cached user data could not be removed:', error);
  }
}


/**
 * Checks whether a valid user is logged in.
 * @returns {boolean} True if a user with id and name is logged in.
 */
function isUserLoggedIn() {
  if (currentUser === null) return false;
  if (!currentUser.id || !currentUser.name) return false;
  return true;
}
