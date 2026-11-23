const contactInputIds = ["dialog_input_name", "dialog_input_email", "dialog_input_phone"];
const contactEmailRegex = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[a-zA-Z]{2,}$/;
const contactPhoneRegex = /^\+?[\d\s()\/-]{5,20}$/;

/**
 * Checks all inputs of the contact dialog and shows the errors below the invalid inputs.
 * @returns {boolean} True if all inputs are valid.
 */
function checkIfContactInputsAreValid() {
    resetContactInputErrors();
    const isNameValid = checkIfContactNameIsValid();
    const isEmailValid = checkIfContactEmailIsValid();
    const isPhoneValid = checkIfContactPhoneIsValid();
    return isNameValid && isEmailValid && isPhoneValid;
}


/**
 * Checks that the name is filled.
 * @returns {boolean} True if the name is valid.
 */
function checkIfContactNameIsValid() {
    if (document.getElementById("dialog_input_name").value.trim() === "") {
        showContactInputError("dialog_input_name", "Please enter a name");
        return false;
    }
    return true;
}


/**
 * Checks that the email is filled and has a valid format.
 * @returns {boolean} True if the email is valid.
 */
function checkIfContactEmailIsValid() {
    const email = document.getElementById("dialog_input_email").value.trim();
    if (email === "") {
        showContactInputError("dialog_input_email", "Please enter an email");
        return false;
    }
    if (contactEmailRegex.test(email) === false) {
        showContactInputError("dialog_input_email", "Please enter a valid email");
        return false;
    }
    return true;
}


/**
 * Checks that the phone number is filled and contains only digits, spaces and the characters + ( ) / -.
 * @returns {boolean} True if the phone number is valid.
 */
function checkIfContactPhoneIsValid() {
    const phone = document.getElementById("dialog_input_phone").value.trim();
    if (phone === "") {
        showContactInputError("dialog_input_phone", "Please enter a phone number");
        return false;
    }
    if (contactPhoneRegex.test(phone) === false) {
        showContactInputError("dialog_input_phone", "Please enter a valid phone number");
        return false;
    }
    return true;
}


/**
 * Marks an input of the contact dialog as invalid and shows the error text below it.
 * @param {string} inputId - The id of the invalid input.
 * @param {string} text - The error text.
 */
function showContactInputError(inputId, text) {
    document.getElementById(inputId).classList.add("dialog-input-error");
    document.getElementById(inputId + "_error").textContent = text;
}


/**
 * Removes the error marks and the error texts from the contact dialog.
 */
function resetContactInputErrors() {
    for (const inputId of contactInputIds) {
        document.getElementById(inputId).classList.remove("dialog-input-error");
        document.getElementById(inputId + "_error").textContent = "";
    }
}
