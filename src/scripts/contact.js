const userColor = ["red", "blue", "green", "darfred", "orange", "purple", "pink", "darkgreen", "turquoise", "darkblue"];

let currentUser = null;

/**
 * Initializes the contacts page: loads, sorts and renders the contacts.
 * @returns {Promise<void>}
 */
async function init() {
    await loadContacts();
    sortContacts();
    renderContactList();
}

/**
 * Sorts the stored contacts alphabetically by name.
 */
function sortContacts() {
    const sorted = [...storedContacts].sort((a, b) => a.name.localeCompare(b.name, "de"));
    storedContacts = sorted;
}

/**
 * Renders the contact list grouped by the first letter of the names.
 */
function renderContactList() {
    let currentLetter = "";
    let html = "";
    for (let i = 0; i < storedContacts.length; i++) {
        const letter = storedContacts[i].name[0].toUpperCase();
        if (letter !== currentLetter) {
            currentLetter = letter;
            const alphabet = getContactListAlphabetHtmlElement(letter);
            html += alphabet;
        }
        html += getContactListHtmlElement(storedContacts[i], i);
    }
    document.getElementById("contact_list").innerHTML = html;
}

/**
 * Selects a contact in the list and shows its information.
 * Deselects the contact if it is already selected.
 * @param {number} index - The position of the contact in the stored contacts.
 */
function selectContact(index) {
    const alreadySelected = currentUser === index;
    if (currentUser !== null) {
        deselectContact();
    }
    if (alreadySelected) {
        currentUser = null;
        highlightSelectedContact();
        return;
    }
    showSelectedContact(index);
}

/**
 * Marks the contact as selected in the list and shows its information.
 * @param {number} index - The position of the contact in the stored contacts.
 */
function showSelectedContact(index) {
    currentUser = index;
    document.getElementById("contact" + index).classList.add("contact-list-selected");
    showContactInformation();
    document.getElementById("button_responsive_add_new_contact").classList.add("d-none");
    if (window.innerWidth <= 1000) {
        highlightSelectedContactResponsive();
    }
}

/**
 * Hides the contact information and shows the add contact button again.
 */
function highlightSelectedContact() {
    document.getElementById("contact_information_container").classList.add("d-none");
    document.getElementById("button_responsive_add_new_contact").classList.remove("d-none");
    document.getElementById("button_responsive_contact_options").classList.add("d-none");
}

/**
 * Shows the contact information instead of the contact list on small screens.
 */
function highlightSelectedContactResponsive() {
    document.querySelector(".section-contacts-information").classList.add("d-flex");
    document.querySelector(".section-contact-list").classList.add("d-none");
    document.getElementById("button_responsive_contact_options").classList.remove("d-none");
}

/**
 * Removes the selection mark and the color of the currently selected contact.
 */
function deselectContact() {
    document.getElementById("contact" + currentUser)?.classList.remove("contact-list-selected");
    document.getElementById("contact_initials").classList.remove(storedContacts[currentUser].color);
    document.querySelector(".contact-container-actions-responsive").classList.remove("contact-container-actions-responsive-show");
}

/**
 * Shows the contact list again instead of the contact information on small screens.
 */
function returnToContactList() {
    if (window.innerWidth <= 1000) {
        document.querySelector(".section-contacts-information").classList.remove("d-flex");
        document.querySelector(".section-contact-list").classList.remove("d-none");
        document.getElementById("button_responsive_contact_options").classList.add("d-none");
        document.getElementById("button_responsive_add_new_contact").classList.remove("d-none");
    }
}

/**
 * Opens or closes the edit and delete menu on small screens.
 */
function openContactOptionsResponsive() {
    document.querySelector(".contact-container-actions-responsive").classList.toggle("contact-container-actions-responsive-show");
}

/**
 * Shows the name, email, phone and initials of the selected contact.
 */
function showContactInformation() {
    document.getElementById("contact_information_container").classList.remove("d-none");
    document.getElementById("contact_name").innerText = storedContacts[currentUser].name;
    document.getElementById("contact_email").innerText = storedContacts[currentUser].email;
    document.getElementById("contact_email").href = "mailto:" + storedContacts[currentUser].email;
    document.getElementById("contact_phone").innerText = storedContacts[currentUser].phone;
    document.getElementById("contact_initials").innerText = storedContacts[currentUser].name.split(" ").map(n => n[0]).join("");
    document.getElementById("contact_initials").classList.add("contact-initials", storedContacts[currentUser].color, "add-new-contact");
}

/**
 * Creates a new contact from the dialog inputs and saves it in Firebase.
 * Shows the errors below the inputs and saves nothing if a value is missing or invalid.
 * @returns {Promise<void>}
 */
async function createContact() {
    if (checkIfContactInputsAreValid() === false) {
        return;
    } else {
        document.getElementById("dialog_button_create").disabled = true;
        const isSaved = await saveStoredContact(getContactFromDialog());
        document.getElementById("dialog_button_create").disabled = false;
        if (isSaved === false) return;
        if (currentUser !== null) {
            document.getElementById("contact_initials").classList.remove(storedContacts[currentUser].color);
        }
    }
    addContactSuccess();
}

/**
 * Returns a new contact with the values of the dialog inputs and a random color.
 * @returns {Contact} The new contact without id.
 */
function getContactFromDialog() {
    return {
        name: document.getElementById("dialog_input_name").value.trim(),
        email: document.getElementById("dialog_input_email").value.trim().toLowerCase(),
        phone: document.getElementById("dialog_input_phone").value.trim(),
        color: userColor[Math.floor(Math.random() * userColor.length)]
    };
}

/**
 * Selects and shows the new contact, closes the dialog and shows the success message.
 */
function addContactSuccess() {
    const newContact = storedContacts[storedContacts.length - 1];
    currentUser = storedContacts.length - 1;
    showContactInformation();
    sortContacts();
    currentUser = storedContacts.indexOf(newContact);
    renderContactList();
    document.getElementById("contact" + currentUser).classList.add("contact-list-selected");
    closeDialog();
    if (window.innerWidth <= 1000) {
        showNewContactResponsive(newContact);
    }
    showContactSuccessMessage();
}

/**
 * Shows the information of the new contact instead of the contact list on small screens.
 * @param {Contact} newContact - The new contact.
 */
function showNewContactResponsive(newContact) {
    for (let i = 0; i < storedContacts.length; i++) {
        if (i == storedContacts.indexOf(newContact)) {
            currentUser = i;
            showContactInformationResponsive();
            showContactInformation();
        }
    }
}

/**
 * Shows the success message for one second.
 */
function showContactSuccessMessage() {
    document.getElementById("dialog_success_message").classList.add("dialog-success-message-show");
    setTimeout(() => {
        document.getElementById("dialog_success_message").classList.remove("dialog-success-message-show");
    }, 1000);
}

/**
 * Shows the information of the new contact instead of the contact list on small screens.
 */
function showContactInformationResponsive() {
    document.getElementById("section_contact_information_container").classList.add("d-flex");
    document.querySelector(".section-contact-list").classList.add("d-none");
    document.getElementById("button_responsive_contact_options").classList.remove("d-none");
}

/**
 * Opens the dialog to edit the selected contact.
 */
function editContact() {
    clearDialog();
    loadEditContactHub();
    loadEditContactInformation();
    showDialog()
}

/**
 * Fills the dialog with the initials and the data of the selected contact.
 */
function loadEditContactInformation() {
    document.getElementById("dialog_initials").textContent = getInitials(storedContacts[currentUser].name);
    document.getElementById("dialog_initials").classList.add(storedContacts[currentUser].color);
    document.getElementById("dialog_input_name").value = storedContacts[currentUser].name;
    document.getElementById("dialog_input_email").value = storedContacts[currentUser].email;
    document.getElementById("dialog_input_phone").value = storedContacts[currentUser].phone;
}

/**
 * Saves the changed data of the selected contact and shows it in the list.
 * Shows the errors below the inputs and saves nothing if a value is missing or invalid.
 */
function saveEditContact() {
    if (checkIfContactInputsAreValid() === false) return;
    const selectedContact = storedContacts[currentUser];
    selectedContact.name = document.getElementById("dialog_input_name").value.trim();
    selectedContact.email = document.getElementById("dialog_input_email").value.trim().toLowerCase();
    selectedContact.phone = document.getElementById("dialog_input_phone").value.trim();
    saveStoredContact(selectedContact);
    closeDialog();
    sortContacts();
    currentUser = storedContacts.indexOf(selectedContact);
    renderContactList();
    document.getElementById("contact" + currentUser).classList.add("contact-list-selected");
    showContactInformation();
}

/**
 * Asks for confirmation before the selected contact is deleted.
 */
function deleteContact() {
    if (currentUser === null || !storedContacts[currentUser]) return;
    document.getElementById("confirm_delete_name").textContent = storedContacts[currentUser].name;
    document.getElementById("dialog_confirm_delete").showModal();
}

/**
 * Closes the delete confirmation and deletes the selected contact.
 */
function confirmDeleteContact() {
    document.getElementById("dialog_confirm_delete").close();
    deleteSelectedContact();
}

/**
 * Deletes the selected contact and selects the next contact in the list.
 */
function deleteSelectedContact() {
    if (currentUser === null || !storedContacts[currentUser]) {
        closeDialog();
        return;
    }
    document.getElementById("dialog_initials").classList.remove(storedContacts[currentUser].color);
    document.getElementById("contact_initials").className = "contact-initials add-new-contact";
    document.getElementById("contact_information_container").classList.add("d-none");
    deleteStoredContact(storedContacts[currentUser].id);
    currentUser = storedContacts.length ? Math.min(currentUser, storedContacts.length - 1) : null;
    sortContacts();
    renderContactList();
    closeDialog();
    showNextContactAfterDelete();
}

/**
 * Selects the next contact after deleting, or shows the add contact button if no contact is left.
 */
function showNextContactAfterDelete() {
    if (storedContacts.length > 0) {
        document.getElementById("contact" + currentUser).classList.add("contact-list-selected");
        showContactInformation();
    } else {
        document.getElementById("button_responsive_add_new_contact").classList.remove("d-none");
        document.getElementById("button_responsive_contact_options").classList.add("d-none");
    }
    if (window.innerWidth <= 950) {
        returnToContactListAfterDelete();
    }
}

/**
 * Shows the contact list again after deleting on small screens.
 */
function returnToContactListAfterDelete() {
    document.querySelector(".section-contacts-information").classList.add("d-none");
    document.querySelector(".section-contacts-information").classList.remove("d-flex");
    document.querySelector(".section-contact-list").classList.remove("d-none");
    document.querySelector(".contact-container-actions-responsive").classList.remove("contact-container-actions-responsive-show");
    document.getElementById("button_responsive_add_new_contact").classList.remove("d-none");
}

/**
 * Confirms the contact dialog with the Enter key instead of submitting the form.
 * Creates the contact in the add dialog and saves the changes in the edit dialog.
 * @param {KeyboardEvent} event - The keydown event of the dialog form.
 */
function handleDialogEnterKey(event) {
    if (event.key !== "Enter" || event.target.tagName !== "INPUT") return;
    event.preventDefault();
    const createButton = document.getElementById("dialog_button_create");
    if (!createButton.classList.contains("d-none") && !createButton.disabled) {
        createContact();
    } else if (!document.getElementById("dialog_button_save").classList.contains("d-none")) {
        saveEditContact();
    }
}

registerContactPageEvents();
registerContactDialogEvents();
document.querySelector(".container-dialog-changings").addEventListener("keydown", handleDialogEnterKey);
document.querySelector(".container-dialog-inputs").addEventListener("input", resetContactInputErrors);
document.getElementById("confirm_delete_cancel").addEventListener("click", cancelDeleteContact);
document.getElementById("confirm_delete_submit").addEventListener("click", confirmDeleteContact);
document.getElementById("dialog_confirm_delete").addEventListener("click", handleConfirmDeleteBackdropClick);

init();

/**
 * Selects the clicked contact of the contact list.
 * @param {MouseEvent} event - The click event of the contact list.
 */
function handleContactListClick(event) {
    const contactButton = event.target.closest(".button-contact");
    if (contactButton === null) return;
    selectContact(Number(contactButton.dataset.index));
}

/**
 * Registers the event listeners of the contact list, the contact information and the responsive buttons.
 */
function registerContactPageEvents() {
    document.getElementById("contact_list").addEventListener("click", handleContactListClick);
    document.querySelector(".button-add-new-contact").addEventListener("click", addNewContact);
    document.getElementById("button_responsive_add_new_contact").addEventListener("click", addNewContact);
    document.querySelector(".button-responsive-return").addEventListener("click", returnToContactList);
    document.getElementById("button_edit_contact").addEventListener("click", editContact);
    document.getElementById("button_delete_contact").addEventListener("click", deleteContact);
    document.getElementById("button_responsive_contact_options").addEventListener("click", openContactOptionsResponsive);
    document.getElementById("button_responsive_edit_contact").addEventListener("click", editContact);
    document.getElementById("button_responsive_delete_contact").addEventListener("click", deleteContact);
}

/**
 * Registers the event listeners of the contact dialog.
 * A click on the backdrop closes the dialog, a click inside the dialog does not.
 */
function registerContactDialogEvents() {
    const dialog = document.getElementById("dialog_contact");
    dialog.addEventListener("click", closeDialog);
    dialog.querySelector(".dialog-center").addEventListener("click", stopEventPropagation);
    dialog.querySelector(".button-dialog-cancel-responsive").addEventListener("click", closeDialog);
    dialog.querySelector(".button-dialog-close").addEventListener("click", closeDialog);
    dialog.querySelector(".container-dialog-changings").addEventListener("submit", preventFormSubmit);
    document.getElementById("dialog_button_delete").addEventListener("click", deleteContact);
    document.getElementById("dialog_button_save").addEventListener("click", saveEditContact);
    document.getElementById("dialog_button_cancel").addEventListener("click", closeDialog);
    document.getElementById("dialog_button_create").addEventListener("click", createContact);
}
