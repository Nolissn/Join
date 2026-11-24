/**
 * Opens the dialog to add a new contact.
 */
function addNewContact() {
    clearDialog();
    document.getElementById("dialog_button_cancel").classList.remove("d-none");
    document.getElementById("dialog_button_create").classList.remove("d-none");
    document.getElementById("button_responsive_add_new_contact").classList.remove("d-none");
    document.getElementById("button_responsive_contact_options").classList.add("d-none");
    document.getElementById("dialog_initials").innerHTML = getDialogEmptyInitialsHtmlElement();
    showDialog();
}


/**
 * Changes the title and the buttons of the dialog for editing a contact.
 */
function loadEditContactHub() {
    document.getElementById("dialog_title").innerHTML = "Edit Contact";
    document.getElementById("dialog_slogan").classList.add("d-none");
    document.getElementById("dialog_underline").classList.remove("dialog-underline");
    document.getElementById("dialog_underline").classList.add("dialog-title-underline");
    document.getElementById("dialog_button_delete").classList.remove("d-none");
    document.getElementById("dialog_button_save").classList.remove("d-none");
}


/**
 * Closes the delete confirmation without deleting the contact.
 */
function cancelDeleteContact() {
    document.getElementById("dialog_confirm_delete").close();
}


/**
 * Closes the delete confirmation when the user clicks on the backdrop.
 * @param {MouseEvent} event - The click event of the confirmation dialog.
 */
function handleConfirmDeleteBackdropClick(event) {
    if (event.target === event.currentTarget) cancelDeleteContact();
}


/**
 * Opens the contact dialog.
 */
function showDialog() {
    const dialog = document.getElementById("dialog_contact");
    dialog.showModal();
    lockBodyScroll();
}


/**
 * Prevents the page behind an open dialog from scrolling.
 */
function lockBodyScroll() {
    document.body.classList.add("body-scroll-locked");
}


/**
 * Allows the page to scroll again once no dialog is open anymore.
 */
function unlockBodyScroll() {
    if (document.querySelector("dialog[open]") !== null) return;
    document.body.classList.remove("body-scroll-locked");
}


/**
 * Clears and closes the contact dialog.
 */
function closeDialog() {
    const dialog = document.getElementById("dialog_contact");
    clearDialog();
    dialog.close();
}


/**
 * Resets the inputs, the errors, the initials and the buttons of the contact dialog.
 */
function clearDialog() {
    document.getElementById("dialog_title").innerHTML = "Add contact";
    document.getElementById("dialog_input_name").value = "";
    document.getElementById("dialog_input_email").value = "";
    document.getElementById("dialog_input_phone").value = "";
    document.getElementById("dialog_initials").className = "dialog-initials add-new-contact";
    document.getElementById("dialog_initials").innerHTML = getDialogEmptyInitialsHtmlElement();
    document.getElementById("dialog_button_cancel").classList.add("d-none");
    document.getElementById("dialog_button_create").classList.add("d-none");
    document.getElementById("dialog_button_delete").classList.add("d-none");
    document.getElementById("dialog_button_save").classList.add("d-none");
    document.getElementById("dialog_underline").classList.remove("dialog-title-underline");
    document.getElementById("dialog_slogan").classList.remove("d-none");
    document.getElementById("dialog_underline").classList.add("dialog-underline");
    resetContactInputErrors();
}


/**
 * Stops the click event, so a click inside the dialog does not close it.
 * @param {MouseEvent} event - The click event.
 */
function stopEventPropagation(event) {
    event.stopPropagation();
}


/**
 * Prevents the dialog form from being submitted.
 * @param {SubmitEvent} event - The submit event.
 */
function preventFormSubmit(event) {
    event.preventDefault();
}
