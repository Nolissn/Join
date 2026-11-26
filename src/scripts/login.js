const logInEmailRegex = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[a-zA-Z]{2,}$/;
const guestEmail = 'guest@guestmail.com';

/**
 * Registers the event listeners of the login form.
 */
function initLogIn() {
  document.querySelector('.log_in_card_log_in_button').addEventListener('click', logIn);
  document.querySelector('.log_in_card_guest_log_in_button').addEventListener('click', guestLogIn);
  for (const inputId of ['email', 'password']) {
    const input = document.getElementById(inputId);
    input.addEventListener('input', () => handleLogInInput(input));
    input.addEventListener('blur', () => validateLogInInputOnBlur(input));
    input.addEventListener('keydown', handleLogInEnterKey);
  }
}


/**
 * Marks an input as touched and removes its error while the user types.
 * The combined "incorrect" error marks both inputs, so it is removed from both.
 * @param {HTMLInputElement} input - The input the user types in.
 */
function handleLogInInput(input) {
  input.dataset.touched = 'true';
  const passwordInput = document.getElementById('password');
  const hasCombinedError = passwordInput.classList.contains('auth_card_input_error') && document.getElementById('passwordErrorText').textContent === '';
  if (hasCombinedError) return resetLogInErrors();
  clearLogInError(input.id);
}


/**
 * Validates an input as soon as it loses the focus.
 * An empty input the user never typed in is skipped, so tabbing through the form shows no errors.
 * @param {HTMLInputElement} input - The input that lost the focus.
 */
function validateLogInInputOnBlur(input) {
  if (input.value === '' && input.dataset.touched !== 'true') return;
  clearLogInError(input.id);
  if (input.id === 'email') checkIfLogInEmailIsValid(input.value.trim().toLowerCase());
  else checkIfLogInPasswordIsFilled(input.value);
}


/**
 * Starts the login when Enter is pressed in an input.
 * @param {KeyboardEvent} event - The keydown event.
 */
function handleLogInEnterKey(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    logIn();
  }
}


/**
 * Logs in with the entered email and password while the loading screen is shown.
 * Shows an error if the inputs are invalid or the request fails.
 * @returns {Promise<void>}
 */
async function logIn() {
  resetLogInErrors();
  const email = document.getElementById('email').value.trim().toLowerCase();
  const password = document.getElementById('password').value;
  if (checkIfLogInInputsAreValid(email, password) === false) return;
  try {
    await withLoadingScreen(() => logInWithEmail(email, password));
  } catch (error) {
    showLogInError('password', 'An error occurred. Please check your internet connection and try again.');
  }
}


/**
 * Loads the user with the email from Firestore and checks the password.
 * @param {string} email - The email in lowercase.
 * @param {string} password - The entered password.
 * @returns {Promise<void>}
 */
async function logInWithEmail(email, password) {
  const usersDbApi = await import('./data/usersDbApi.js');
  const user = await usersDbApi.getUserByEmail(email);
  handleLogInResult(user, password);
}


/**
 * Checks the email and the password and shows the errors of both inputs.
 * @param {string} email - The entered email.
 * @param {string} password - The entered password.
 * @returns {boolean} True if both inputs are valid.
 */
function checkIfLogInInputsAreValid(email, password) {
  const isEmailValid = checkIfLogInEmailIsValid(email);
  const isPasswordFilled = checkIfLogInPasswordIsFilled(password);
  return isEmailValid && isPasswordFilled;
}


/**
 * Checks that the email is filled and has a valid format.
 * @param {string} email - The entered email.
 * @returns {boolean} True if the email is valid.
 */
function checkIfLogInEmailIsValid(email) {
  if (email === '') {
    showLogInError('email', 'Please enter your email');
    return false;
  }
  if (logInEmailRegex.test(email) === false) {
    showLogInError('email', 'Please enter a valid email');
    return false;
  }
  return true;
}


/**
 * Checks that the password is filled.
 * @param {string} password - The entered password.
 * @returns {boolean} True if the password is filled.
 */
function checkIfLogInPasswordIsFilled(password) {
  if (password === '') {
    showLogInError('password', 'Please enter your password');
    return false;
  }
  return true;
}


/**
 * Logs in the user and redirects to the summary page if the password matches. Shows an error otherwise.
 * @param {User|null} user - The found user, or null if no user has this email.
 * @param {string} password - The entered password.
 */
function handleLogInResult(user, password) {
  if (user === null || user.password !== password) {
    showLogInError('email', 'Email or password is incorrect');
    document.getElementById('password').classList.add('auth_card_input_error');
    return;
  }
  setCurrentUser(user);
  location.href = 'src/statics/summary.html';
}


/**
 * Logs in as guest while the loading screen is shown.
 * @returns {Promise<void>}
 */
async function guestLogIn() {
  resetLogInErrors();
  try {
    await withLoadingScreen(logInAsGuest);
  } catch (error) {
    showLogInError('password', 'An error occurred. Please check your internet connection and try again.');
  }
}


/**
 * Loads the guest user from Firestore, logs in as guest and redirects to the summary page.
 * @returns {Promise<void>}
 */
async function logInAsGuest() {
  const usersDbApi = await import('./data/usersDbApi.js');
  const guestUser = await usersDbApi.getUserByEmail(guestEmail);
  if (guestUser === null) {
    showLogInError('email', 'Guest log in is currently not available');
    return;
  }
  setCurrentUser(guestUser, true);
  location.href = 'src/statics/summary.html';
}


/**
 * Marks an input as invalid and shows the error text below it.
 * @param {string} inputId - "email" or "password".
 * @param {string} text - The error text.
 */
function showLogInError(inputId, text) {
  document.getElementById(inputId).classList.add('auth_card_input_error');
  document.getElementById(inputId + 'ErrorText').textContent = text;
}


/**
 * Removes the error marks and the error texts from the login form.
 */
function resetLogInErrors() {
  for (const inputId of ['email', 'password']) {
    clearLogInError(inputId);
  }
}


/**
 * Removes the error mark and the error text of one input of the login form.
 * @param {string} inputId - "email" or "password".
 */
function clearLogInError(inputId) {
  document.getElementById(inputId).classList.remove('auth_card_input_error');
  document.getElementById(inputId + 'ErrorText').textContent = '';
}


document.addEventListener('DOMContentLoaded', initLogIn);
