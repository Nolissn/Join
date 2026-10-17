import { registerUser, getUserByEmail } from "./data/usersDbApi.js";
import { createUser } from "./data/usersModel.js";

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
const signUpSuccessDuration = 3500;

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

async function registerNewUser(userValues) {
  if ((await checkIfEmailIsAvailable(userValues.email)) === false) return false;
  await registerUser(userValues);
  return true;
}

function showSignUpSuccessDialog() {
  document.getElementById("signUpSuccessDialog").showModal();
  setTimeout(() => (location.href = "../../index.html"), signUpSuccessDuration);
}

async function checkIfEmailIsAvailable(email) {
  const existingUser = await getUserByEmail(email);
  if (existingUser !== null) {
    showErrorText("Email is already in use");
    return false;
  }
  return true;
}

function checkIfSignUpFormIsValid(values) {
  if (checkIfAllInputsAreFilled() === false) return false;
  if (checkIfInputsAreValid(values) === false) return false;
  return checkIfPrivacyPolicyIsAccepted();
}

function checkIfPrivacyPolicyIsAccepted() {
  const privacyCheckbox = document.getElementById("acceptPrivacyPolicy");
  if (privacyCheckbox.checked === false) {
    showErrorText("Please accept the privacy policy");
    return false;
  }
  return true;
}

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

function getSignUpInputValues() {
  return {
    name: document.getElementById(signUpInputIds[0]).value.trim(),
    email: document.getElementById(signUpInputIds[1]).value.trim().toLowerCase(),
    password: document.getElementById(signUpInputIds[2]).value,
    confirmPassword: document.getElementById(signUpInputIds[3]).value,
  };
}

function checkIfInputsAreValid(values) {
  if (checkIfNameIsValid(values.name) === false) return false;
  if (isEmailValid(values.email) === false) {
    showInputError(["emailSignUp"], "Please enter a valid email address");
    return false;
  }
  return checkIfPasswordsAreValid(values);
}

function checkIfNameIsValid(name) {
  if (checkIfNameCharactersAreValid(name) === false) return false;
  if (checkIfNameHasNoDoubleCharacters(name) === false) return false;
  return checkIfNameLengthIsValid(name);
}

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

function isEmailValid(email) {
  return emailRegex.test(email);
}

function showInputError(inputIds, text) {
  for (const inputId of inputIds) {
    document.getElementById(inputId).classList.add("auth_card_input_error");
  }
  showErrorText(text);
}

function showErrorText(text) {
  const errorTextElement = document.getElementById("signUpErrorTextId");
  errorTextElement.textContent = text;
}

function resetSignUpErrors() {
  for (const inputId of signUpInputIds) {
    document.getElementById(inputId).classList.remove("auth_card_input_error");
  }
  showErrorText("");
}
window.resetSignUpErrors = resetSignUpErrors;
