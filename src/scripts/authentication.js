import { registerUser, getUserByEmail } from "./data/usersDbApi.js";
import { saveTutorialTask } from "./data/joinDbApi.js";
import { saveOwnContact, saveDefaultContacts } from "./data/contactsDbApi.js";

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
const emailRegex = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[a-zA-Z]{2,}$/;
const whitespaceRegex = /\s/;
const uppercaseLetterRegex = /\p{Lu}/u;
const lowercaseLetterRegex = /\p{Ll}/u;
const digitRegex = /\d/;
const signUpSuccessDuration = 3000;
const nameMaxLength = 50;
let signUpIsRunning = false;
const passwordMinLength = 8;
const errorTextMaxLength = 36;
const nameExample = "e.g. Anna Smith";
const emailExample = "e.g. name@mail.com";
const passwordExample = "e.g. Join2026";
const nameFallbackText = "Invalid name, e.g. Anna Smith-Lee";
const passwordFallbackText = "8+ chars, A-Z, a-z, 0-9, no spaces";

/**
 * @typedef {Object} SignUpValues
 * @property {string} name - The entered name.
 * @property {string} email - The entered email in lowercase.
 * @property {string} password - The entered password.
 * @property {string} confirmPassword - The entered password confirmation.
 */

/**
 * Starts the sign up and blocks further starts until it is finished, so a held Enter key can't register the user twice.
 * @returns {Promise<void>}
 */
async function signUp() {
  if (signUpIsRunning) return;
  signUpIsRunning = true;
  await runSignUp();
  signUpIsRunning = false;
}


/**
 * Signs up a new user: validates the form, registers the user while the loading screen is shown and shows the success dialog.
 * @returns {Promise<void>}
 */
async function runSignUp() {
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


/**
 * Registers a new user if the email is not used yet and saves the tutorial task, the own contact and the default contacts for the user.
 * @param {{name: string, email: string, password: string}} userValues - The validated values without the password confirmation.
 * @returns {Promise<boolean>} True if the user was registered, false if the email is already in use.
 */
async function registerNewUser(userValues) {
  if ((await checkIfEmailIsAvailable(userValues.email)) === false) return false;
  const userId = await registerUser(userValues);
  await saveTutorialTask(userId);
  await saveOwnContact(userId, userValues);
  await saveDefaultContacts(userId);
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
    showInputError(["emailSignUp"], "Email is already in use");
    return false;
  }
  return true;
}


/**
 * Checks all inputs and the privacy policy at once, so every error is shown at the same time.
 * @param {SignUpValues} values - The values of the sign up form.
 * @returns {boolean} True if the form is valid.
 */
function checkIfSignUpFormIsValid(values) {
  const inputsAreValid = checkIfInputsAreValid(values);
  const privacyPolicyIsAccepted = checkIfPrivacyPolicyIsAccepted();
  return inputsAreValid && privacyPolicyIsAccepted;
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
 * Checks the name, the email and both passwords. Every input is checked, even if an earlier one is invalid.
 * @param {SignUpValues} values - The values of the sign up form.
 * @returns {boolean} True if all values are valid.
 */
function checkIfInputsAreValid(values) {
  const nameIsValid = checkIfNameIsValid(values.name);
  const emailIsValid = checkIfEmailIsValid(values.email);
  const passwordIsValid = checkIfPasswordIsValid(values.password);
  const confirmPasswordIsValid = checkIfConfirmPasswordIsValid(values);
  return nameIsValid && emailIsValid && passwordIsValid && confirmPasswordIsValid;
}


/**
 * Checks the name and shows all of its errors in one text.
 * @param {string} name - The entered name.
 * @returns {boolean} True if the name is valid.
 */
function checkIfNameIsValid(name) {
  if (name === "") return showRequiredError("nameSignUp");
  const nameErrors = getNameErrors(name);
  if (nameErrors.length === 0) return true;
  showInputError(["nameSignUp"], buildErrorText(nameErrors, nameExample, nameFallbackText));
  return false;
}


/**
 * Collects all rules the name breaks.
 * Names with spaces or special characters need at least 3 characters, other names at least 2.
 * @param {string} name - The entered name.
 * @returns {string[]} The short texts of the broken rules.
 */
function getNameErrors(name) {
  const minimumLength = onlyLettersRegex.test(name) ? 2 : 3;
  return [
    [capitalFirstLetterRegex.test(name) === false, "start with A-Z"],
    [nameAllowedCharactersRegex.test(name) === false, "only letters, 0-9, - _ & +"],
    [doubleSpaceRegex.test(name), "no double spaces"],
    [doubleSpecialCharacterRegex.test(name), "no double - _ & +"],
    [endsWithSpecialCharacterRegex.test(name), "no - _ & + at end"],
    [name.length < minimumLength, `min. ${minimumLength} chars`],
    [name.length > nameMaxLength, `max. ${nameMaxLength} chars`],
  ].filter(([hasError]) => hasError).map(([, text]) => text);
}


/**
 * Checks the email and shows an error with an example if the format is invalid.
 * @param {string} email - The entered email.
 * @returns {boolean} True if the email is valid.
 */
function checkIfEmailIsValid(email) {
  if (email === "") return showRequiredError("emailSignUp");
  if (isEmailValid(email)) return true;
  showInputError(["emailSignUp"], `Invalid email, ${emailExample}`);
  return false;
}


/**
 * Checks the password and shows all missing requirements in one text.
 * @param {string} password - The entered password.
 * @returns {boolean} True if the password is valid.
 */
function checkIfPasswordIsValid(password) {
  if (password === "") return showRequiredError("passwordSignUp");
  const passwordErrors = getPasswordErrors(password);
  if (passwordErrors.length === 0) return true;
  showInputError(["passwordSignUp"], buildErrorText(addNeedsPrefix(passwordErrors), passwordExample, passwordFallbackText));
  return false;
}


/**
 * Adds "needs" in front of the first missing requirement, so the text reads like a sentence.
 * @param {string[]} passwordErrors - The short texts of the missing requirements.
 * @returns {string[]} The texts with the prefix.
 */
function addNeedsPrefix(passwordErrors) {
  const requirementIndex = passwordErrors.findIndex((text) => text !== "no spaces");
  if (requirementIndex === -1) return passwordErrors;
  return passwordErrors.map((text, index) => (index === requirementIndex ? `needs ${text}` : text));
}


/**
 * Collects all requirements the password does not meet.
 * @param {string} password - The entered password.
 * @returns {string[]} The short texts of the missing requirements.
 */
function getPasswordErrors(password) {
  return [
    [whitespaceRegex.test(password), "no spaces"],
    [password.length < passwordMinLength, `${passwordMinLength}+ chars`],
    [uppercaseLetterRegex.test(password) === false, "A-Z"],
    [lowercaseLetterRegex.test(password) === false, "a-z"],
    [digitRegex.test(password) === false, "0-9"],
  ].filter(([hasError]) => hasError).map(([, text]) => text);
}


/**
 * Checks that the password confirmation is filled and matches the password.
 * @param {SignUpValues} values - The values of the sign up form.
 * @returns {boolean} True if the confirmation is valid.
 */
function checkIfConfirmPasswordIsValid(values) {
  if (values.confirmPassword === "") return showRequiredError("confirmPasswordSignUp");
  if (values.password === "" || values.password === values.confirmPassword) return true;
  showInputError(["passwordSignUp", "confirmPasswordSignUp"], "Passwords don't match");
  return false;
}


/**
 * Builds one error text from several short texts.
 * An example is added if it fits, a fallback text is used if the text gets too long for the layout.
 * @param {string[]} errorTexts - The short texts of the broken rules.
 * @param {string} example - An example of a valid value.
 * @param {string} fallbackText - The text used if the combined text is too long.
 * @returns {string} The error text.
 */
function buildErrorText(errorTexts, example, fallbackText) {
  const combinedText = capitalizeFirstLetter(errorTexts.join(", "));
  const textWithExample = `${combinedText}, ${example}`;
  if (textWithExample.length <= errorTextMaxLength) return textWithExample;
  if (combinedText.length <= errorTextMaxLength) return combinedText;
  return fallbackText;
}


/**
 * Changes the first letter of a text to uppercase.
 * @param {string} text - The text to change.
 * @returns {string} The text with an uppercase first letter.
 */
function capitalizeFirstLetter(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}


/**
 * Marks an empty input and shows that it is required.
 * @param {string} inputId - The id of the empty input.
 * @returns {boolean} Always false, because the input is invalid.
 */
function showRequiredError(inputId) {
  showInputError([inputId], "This field is required");
  return false;
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
 * Marks the inputs as invalid and shows the error text below the last of them.
 * @param {string[]} inputIds - The ids of the invalid inputs.
 * @param {string} text - The error text.
 */
function showInputError(inputIds, text) {
  for (const inputId of inputIds) {
    document.getElementById(inputId).classList.add("auth_card_input_error");
  }
  const lastInputId = inputIds[inputIds.length - 1];
  document.getElementById(`${lastInputId}Error`).textContent = text;
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
    document.getElementById(`${inputId}Error`).textContent = "";
  }
  showErrorText("");
}


/**
 * Removes the error mark and the error text of one input.
 * When the password confirmation is cleared, the mismatch mark of the password is removed too, if the password has no own error.
 * @param {string} inputId - The id of the input.
 */
function clearInputError(inputId) {
  document.getElementById(inputId).classList.remove("auth_card_input_error");
  document.getElementById(`${inputId}Error`).textContent = "";
  if (inputId !== "confirmPasswordSignUp") return;
  if (document.getElementById("passwordSignUpError").textContent === "") {
    document.getElementById("passwordSignUp").classList.remove("auth_card_input_error");
  }
}


/**
 * Validates an input as soon as it loses the focus.
 * An empty input the user never typed in is skipped, so tabbing through the form shows no errors.
 * @param {HTMLInputElement} input - The input that lost the focus.
 */
function validateSignUpInputOnBlur(input) {
  if (input.value === "" && input.dataset.touched !== "true") return;
  const values = getSignUpInputValues();
  clearInputError(input.id);
  if (input.id === "nameSignUp") checkIfNameIsValid(values.name);
  if (input.id === "emailSignUp") checkIfEmailIsValid(values.email);
  if (input.id === "passwordSignUp") validatePasswordInputsOnBlur(values);
  if (input.id === "confirmPasswordSignUp") checkIfConfirmPasswordIsValid(values);
}


/**
 * Validates the password and checks the confirmation again if it is already filled, because changing the password can fix or break the match.
 * @param {SignUpValues} values - The values of the sign up form.
 */
function validatePasswordInputsOnBlur(values) {
  checkIfPasswordIsValid(values.password);
  if (values.confirmPassword === "") return;
  clearInputError("confirmPasswordSignUp");
  checkIfConfirmPasswordIsValid(values);
}


/**
 * Starts the sign up when Enter is pressed in an input or on the sign up button.
 * @param {KeyboardEvent} event - The keydown event.
 */
function handleSignUpEnterKey(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    signUp();
  }
}


/**
 * Checks or unchecks the privacy policy checkbox when Enter is pressed on it and removes its error.
 * @param {KeyboardEvent} event - The keydown event.
 */
function handlePrivacyCheckboxEnterKey(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    event.currentTarget.checked = !event.currentTarget.checked;
    showErrorText("");
  }
}


/**
 * Registers the event listeners of the sign up form.
 * Clicking into an input only removes the error of this input, leaving an input validates it.
 */
function registerSignUpEvents() {
  for (const inputId of signUpInputIds) {
    const input = document.getElementById(inputId);
    input.addEventListener("focus", () => clearInputError(inputId));
    input.addEventListener("input", () => (input.dataset.touched = "true"));
    input.addEventListener("blur", () => validateSignUpInputOnBlur(input));
    input.addEventListener("keydown", handleSignUpEnterKey);
  }
  const privacyCheckbox = document.getElementById("acceptPrivacyPolicy");
  privacyCheckbox.addEventListener("change", () => showErrorText(""));
  privacyCheckbox.addEventListener("keydown", handlePrivacyCheckboxEnterKey);
  const signUpButton = document.querySelector(".sign_up_card_sign_up_button");
  signUpButton.addEventListener("click", signUp);
  signUpButton.addEventListener("keydown", handleSignUpEnterKey);
}


registerSignUpEvents();
