const contactInputIds = ["dialog_input_name", "dialog_input_email", "dialog_input_phone"];
const contactEmailRegex = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[a-zA-Z]{2,}$/;
const contactPhoneRegex = /^\+?[\d\s()\/-]{5,20}$/;
const contactNameMaxLength = 50;
const contactInputValidators = {
    dialog_input_name: checkIfContactNameIsValid,
    dialog_input_email: checkIfContactEmailIsValid,
    dialog_input_phone: checkIfContactPhoneIsValid,
};

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
 * Checks that the name is filled and not longer than the maximum length.
 * @returns {boolean} True if the name is valid.
 */
function checkIfContactNameIsValid() {
    const name = document.getElementById("dialog_input_name").value.trim();
    if (name === "") {
        showContactInputError("dialog_input_name", "Please enter a name");
        return false;
    }
    if (name.length > contactNameMaxLength) {
        showContactInputError("dialog_input_name", `The name can't be longer than ${contactNameMaxLength} characters`);
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
        clearContactInputError(inputId);
    }
}


/**
 * Removes the error mark and the error text of one input of the contact dialog.
 * @param {string} inputId - The id of the input.
 */
function clearContactInputError(inputId) {
    document.getElementById(inputId).classList.remove("dialog-input-error");
    document.getElementById(inputId + "_error").textContent = "";
}


/**
 * Marks an input of the contact dialog as touched and removes its error while the user types.
 * @param {Event} event - The input event.
 */
function handleContactInput(event) {
    if (!contactInputIds.includes(event.target.id)) return;
    event.target.dataset.touched = "true";
    clearContactInputError(event.target.id);
}


/**
 * Validates an input of the contact dialog as soon as it loses the focus.
 * Untouched inputs and moving the focus to the close, cancel or delete button are skipped.
 * @param {FocusEvent} event - The focusout event.
 */
function validateContactInputOnBlur(event) {
    const input = event.target;
    if (!contactInputIds.includes(input.id) || input.dataset.touched !== "true") return;
    if (event.relatedTarget?.closest(".button-dialog-close, #dialog_button_cancel, #dialog_button_delete")) return;
    clearContactInputError(input.id);
    contactInputValidators[input.id]();
}


/**
 * Forgets which inputs of the contact dialog the user has touched.
 */
function resetTouchedContactInputs() {
    for (const inputId of contactInputIds) {
        delete document.getElementById(inputId).dataset.touched;
    }
}
