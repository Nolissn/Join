import { registerUser, getUserByEmail } from "./data/usersDbApi.js";
import { createUser } from "./data/usersModel.js";
import { saveTutorialTask } from "./data/joinDbApi.js";

const signUpInputIds = [
  "nameSignUp",
  "emailSignUp",
  "passwordSignUp",
  "confirmPasswordSignUp",
];

const capitalFirstLetterRegex = /^\p{Lu}/u;
const nameAllowedCharactersRegex = /^[\p{L}\d _&+-]+$/u;
const doubleSpaceRegex = / {2}/;
const doubleSpecialCharacterRegex = /[_&+-]{2}/;
const endsWithSpecialCharacterRegex = /[_&+-]$/;
const onlyLettersRegex = /^\p{L}+$/u;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const whitespaceRegex = /\s/;
const uppercaseLetterRegex = /\p{Lu}/u;
const lowercaseLetterRegex = /\p{Ll}/u;
const digitRegex = /\d/;
const signUpSuccessDuration = 3000;

/**
 * @typedef {Object} SignUpValues
 * @property {string} name - The entered name.
 * @property {string} email - The entered email in lowercase.
 * @property {string} password - The entered password.
 * @property {string} confirmPassword - The entered password confirmation.
 */

/**
 * Signs up a new user: validates the form, registers the user while the loading screen is shown and shows the success dialog.
 * @returns {Promise<void>}
 */
async function signUp() {
  resetSignUpErrors();
  const currentValues = getSignUpInputValues();
  if (checkIfSignUpFormIsValid(currentValues) === false) return;
  const { confirmPassword, ...validValues } = currentValues;
  try {
    if ((await withLoadingScreen(() => registerNewUser(validValues))) === false) return;
    showSignUpSuccessDialog();
  } catch (error) {
    showErrorText("An error occurred. Please check your internet connection and try again.");
  }
}
window.signUp = signUp;

/**
 * Registers a new user if the email is not used yet and saves the tutorial task for the user.
 * @param {{name: string, email: string, password: string}} userValues - The validated values without the password confirmation.
 * @returns {Promise<boolean>} True if the user was registered, false if the email is already in use.
 */
async function registerNewUser(userValues) {
  if ((await checkIfEmailIsAvailable(userValues.email)) === false) return false;
  const userId = await registerUser(userValues);
  await saveTutorialTask(userId);
  return true;
}

/**
 * Shows the success dialog and redirects to the login page after a short delay.
 */
function showSignUpSuccessDialog() {
  document.getElementById("signUpSuccessDialog").showModal();
  setTimeout(() => (location.href = "../../index.html"), signUpSuccessDuration);
}

/**
 * Checks whether no user is registered with the email yet and shows an error otherwise.
 * @param {string} email - The email to check.
 * @returns {Promise<boolean>} True if the email is available.
 */
async function checkIfEmailIsAvailable(email) {
  const existingUser = await getUserByEmail(email);
  if (existingUser !== null) {
    showErrorText("Email is already in use");
    return false;
  }
  return true;
}

/**
 * Checks whether all inputs are filled, all values are valid and the privacy policy is accepted.
 * @param {SignUpValues} values - The values of the sign up form.
 * @returns {boolean} True if the form is valid.
 */
function checkIfSignUpFormIsValid(values) {
  if (checkIfAllInputsAreFilled() === false) return false;
  if (checkIfInputsAreValid(values) === false) return false;
  return checkIfPrivacyPolicyIsAccepted();
}

/**
 * Checks whether the privacy policy checkbox is checked and shows an error otherwise.
 * @returns {boolean} True if the privacy policy is accepted.
 */
function checkIfPrivacyPolicyIsAccepted() {
  const privacyCheckbox = document.getElementById("acceptPrivacyPolicy");
  if (privacyCheckbox.checked === false) {
    showErrorText("Please accept the privacy policy");
    return false;
  }
  return true;
}

/**
 * Checks whether all sign up inputs are filled and marks the empty ones.
 * @returns {boolean} True if all inputs are filled.
 */
function checkIfAllInputsAreFilled() {
  const emptyInputIds = signUpInputIds.filter(
    (inputId) => document.getElementById(inputId).value.trim() === ""
  );
  if (emptyInputIds.length > 0) {
    showInputError(emptyInputIds, "A field is empty. Please fill in all fields");
    return false;
  }
  return true;
}

/**
 * Reads the values of the sign up form.
 * The name and the email are trimmed, the email is converted to lowercase.
 * @returns {SignUpValues} The values of the form.
 */
function getSignUpInputValues() {
  return {
    name: document.getElementById(signUpInputIds[0]).value.trim(),
    email: document.getElementById(signUpInputIds[1]).value.trim().toLowerCase(),
    password: document.getElementById(signUpInputIds[2]).value,
    confirmPassword: document.getElementById(signUpInputIds[3]).value,
  };
}

/**
 * Checks the name, the email and the passwords of the sign up form.
 * @param {SignUpValues} values - The values of the sign up form.
 * @returns {boolean} True if all values are valid.
 */
function checkIfInputsAreValid(values) {
  if (checkIfNameIsValid(values.name) === false) return false;
  if (isEmailValid(values.email) === false) {
    showInputError(["emailSignUp"], "Please enter a valid email address");
    return false;
  }
  return checkIfPasswordsAreValid(values);
}

/**
 * Checks the characters and the length of the name.
 * @param {string} name - The entered name.
 * @returns {boolean} True if the name is valid.
 */
function checkIfNameIsValid(name) {
  if (checkIfNameCharactersAreValid(name) === false) return false;
  if (checkIfNameHasNoDoubleCharacters(name) === false) return false;
  return checkIfNameLengthIsValid(name);
}

/**
 * Checks that the name starts with a capital letter, contains only allowed characters and does not end with a special character.
 * @param {string} name - The entered name.
 * @returns {boolean} True if the characters are valid.
 */
function checkIfNameCharactersAreValid(name) {
  if (capitalFirstLetterRegex.test(name) === false) {
    showInputError(["nameSignUp"], "Your name must start with a capital letter");
    return false;
  }
  if (nameAllowedCharactersRegex.test(name) === false) {
    showInputError(["nameSignUp"], "Invalid character in your name");
    return false;
  }
  if (endsWithSpecialCharacterRegex.test(name) === true) {
    showInputError(["nameSignUp"], "Your name can't end with a special character");
    return false;
  }
  return true;
}

/**
 * Checks that the name contains no two spaces and no two special characters in a row.
 * @param {string} name - The entered name.
 * @returns {boolean} True if no character is doubled.
 */
function checkIfNameHasNoDoubleCharacters(name) {
  if (doubleSpaceRegex.test(name) === true) {
    showInputError(["nameSignUp"], "Your name can't contain two spaces in a row");
    return false;
  }
  if (doubleSpecialCharacterRegex.test(name) === true) {
    showInputError(["nameSignUp"], "Your name can't contain two special characters in a row");
    return false;
  }
  return true;
}

/**
 * Checks that the name is between 2 and 16 characters long.
 * Names with spaces or special characters need at least 3 characters.
 * @param {string} name - The entered name.
 * @returns {boolean} True if the length is valid.
 */
function checkIfNameLengthIsValid(name) {
  const minimumLength = onlyLettersRegex.test(name) ? 2 : 3;
  if (name.length < minimumLength) {
    showInputError(["nameSignUp"], `Your name needs to have at least ${minimumLength} characters`);
    return false;
  }
  if (name.length > 16) {
    showInputError(["nameSignUp"], "Your name can't be longer than 16 characters");
    return false;
  }
  return true;
}

/**
 * Checks that both passwords match, contain no spaces and are strong enough.
 * @param {SignUpValues} values - The values of the sign up form.
 * @returns {boolean} True if the passwords are valid.
 */
function checkIfPasswordsAreValid(values) {
  if (values.password !== values.confirmPassword) {
    showInputError(["passwordSignUp", "confirmPasswordSignUp"], "Your passwords don't match. Please try again");
    return false;
  }
  if (whitespaceRegex.test(values.password) === true) {
    showInputError(["passwordSignUp", "confirmPasswordSignUp"], "Your password can't contain spaces");
    return false;
  }
  return checkIfPasswordIsStrong(values.password);
}

/**
 * Checks that the password has at least 8 characters, uppercase and lowercase letters and a number.
 * @param {string} password - The entered password.
 * @returns {boolean} True if the password is strong enough.
 */
function checkIfPasswordIsStrong(password) {
  if (password.length < 8) {
    showInputError(["passwordSignUp", "confirmPasswordSignUp"], "Your password must be at least 8 characters long");
    return false;
  }
  if (uppercaseLetterRegex.test(password) === false || lowercaseLetterRegex.test(password) === false) {
    showInputError(["passwordSignUp", "confirmPasswordSignUp"], "Your password must contain uppercase and lowercase letters");
    return false;
  }
  if (digitRegex.test(password) === false) {
    showInputError(["passwordSignUp", "confirmPasswordSignUp"], "Your password must contain at least one number");
    return false;
  }
  return true;
}

/**
 * Checks whether the email has a valid format.
 * @param {string} email - The entered email.
 * @returns {boolean} True if the email is valid.
 */
function isEmailValid(email) {
  return emailRegex.test(email);
}

/**
 * Marks the inputs as invalid and shows the error text.
 * @param {string[]} inputIds - The ids of the invalid inputs.
 * @param {string} text - The error text.
 */
function showInputError(inputIds, text) {
  for (const inputId of inputIds) {
    document.getElementById(inputId).classList.add("auth_card_input_error");
  }
  showErrorText(text);
}

/**
 * Shows a text in the error field of the sign up form.
 * @param {string} text - The error text, or an empty string to clear it.
 */
function showErrorText(text) {
  const errorTextElement = document.getElementById("signUpErrorTextId");
  errorTextElement.textContent = text;
}

/**
 * Removes all error marks and the error text from the sign up form.
 */
function resetSignUpErrors() {
  for (const inputId of signUpInputIds) {
    document.getElementById(inputId).classList.remove("auth_card_input_error");
  }
  showErrorText("");
}
window.resetSignUpErrors = resetSignUpErrors;
