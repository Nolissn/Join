const logInEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function initLogIn() {
  document.querySelector('.log_in_card_log_in_button').addEventListener('click', logIn);
  document.querySelector('.log_in_card_guest_log_in_button').addEventListener('click', guestLogIn);
  document.getElementById('email').addEventListener('input', resetLogInErrors);
  document.getElementById('password').addEventListener('input', resetLogInErrors);
  document.getElementById('email').addEventListener('keydown', handleLogInEnterKey);
  document.getElementById('password').addEventListener('keydown', handleLogInEnterKey);
}

function handleLogInEnterKey(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    logIn();
  }
}

async function logIn() {
  resetLogInErrors();
  const email = document.getElementById('email').value.trim().toLowerCase();
  const password = document.getElementById('password').value;
  if (checkIfLogInInputsAreValid(email, password) === false) return;
  try {
    const usersDbApi = await import('./data/usersDbApi.js');
    const user = await usersDbApi.getUserByEmail(email);
    handleLogInResult(user, password);
  } catch (error) {
    showLogInError('email', 'Connection failed, please try again');
  }
}

function checkIfLogInInputsAreValid(email, password) {
  const isEmailValid = checkIfLogInEmailIsValid(email);
  const isPasswordFilled = checkIfLogInPasswordIsFilled(password);
  return isEmailValid && isPasswordFilled;
}

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

function checkIfLogInPasswordIsFilled(password) {
  if (password === '') {
    showLogInError('password', 'Please enter your password');
    return false;
  }
  return true;
}

function handleLogInResult(user, password) {
  if (user === null || user.password !== password) {
    showLogInError('email', 'Email or password is incorrect');
    document.getElementById('password').classList.add('auth_card_input_error');
    return;
  }
  setCurrentUser(user);
  location.href = 'src/statics/summary.html';
}

function guestLogIn() {
  setCurrentUser({ id: 'guest', name: 'Guest', email: '' });
  location.href = 'src/statics/summary.html';
}

function showLogInError(inputId, text) {
  document.getElementById(inputId).classList.add('auth_card_input_error');
  document.getElementById(inputId + 'ErrorText').textContent = text;
}

function resetLogInErrors() {
  for (const inputId of ['email', 'password']) {
    document.getElementById(inputId).classList.remove('auth_card_input_error');
    document.getElementById(inputId + 'ErrorText').textContent = '';
  }
}

document.addEventListener('DOMContentLoaded', initLogIn);
