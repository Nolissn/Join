import { db } from "./data/joinDbConfig.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

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
 * Opens the dialog to add a new contact.
 */
function addNewContact() {
    clearDialog();
    document.getElementById("dialog_input_name").setAttribute("required", "required");
    document.getElementById("dialog_input_email").setAttribute("required", "required");
    document.getElementById("dialog_input_phone").setAttribute("required", "required");
    document.getElementById("dialog_button_cancel").classList.remove("d-none");
    document.getElementById("dialog_button_create").classList.remove("d-none");
    document.getElementById("button_responsive_add_new_contact").classList.remove("d-none");
    document.getElementById("button_responsive_contact_options").classList.add("d-none");
    document.getElementById("dialog_initials").innerHTML = getDialogEmptyInitialsHtmlElement();
    showDialog();
}

/**
 * Creates a new contact from the dialog inputs and saves it in Firebase.
 * Does nothing except marking the inputs if a value is missing or invalid.
 * @returns {Promise<void>}
 */
async function createContact() {
    if (!document.getElementById("dialog_input_name").value.trim() || !document.getElementById("dialog_input_email").value.trim().includes("@") || !document.getElementById("dialog_input_phone").value.trim()) {
        checkDialogInputs();
        return;
    } else {
        document.getElementById("dialog_button_create").disabled = true;
        const isSaved = await saveStoredContact({
            name: document.getElementById("dialog_input_name").value,
            email: document.getElementById("dialog_input_email").value,
            phone: document.getElementById("dialog_input_phone").value,
            color: userColor[Math.floor(Math.random() * userColor.length)]
        });
        document.getElementById("dialog_button_create").disabled = false;
        if (isSaved === false) return;
        if (currentUser !== null) {
            document.getElementById("contact_initials").classList.remove(storedContacts[currentUser].color);
        }
    }
    addContactSuccess();
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
        for (let i = 0; i < storedContacts.length; i++) {
            if (i == storedContacts.indexOf(newContact)) {
                currentUser = i;
                showContactInformationResponsive();
                showContactInformation();
            }
        }
    }
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
 * Clears the first dialog input that contains only spaces, so the required message is shown.
 */
function checkDialogInputs() {
    if (!document.getElementById("dialog_input_name").value.trim()) {
        document.getElementById("dialog_input_name").value = "";
        return;
    } else if (!document.getElementById("dialog_input_email").value.trim()) {
        document.getElementById("dialog_input_email").value = "";
        return;
    } else if (!document.getElementById("dialog_input_phone").value.trim()) {
        document.getElementById("dialog_input_phone").value = "";
        return;
    }
    return;
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
 * Fills the dialog with the initials and the data of the selected contact.
 */
function loadEditContactInformation() {
    document.getElementById("dialog_initials").innerHTML = getInitials(storedContacts[currentUser].name);
    document.getElementById("dialog_initials").classList.add(storedContacts[currentUser].color);
    document.getElementById("dialog_input_name").value = storedContacts[currentUser].name;
    document.getElementById("dialog_input_email").value = storedContacts[currentUser].email;
    document.getElementById("dialog_input_phone").value = storedContacts[currentUser].phone;
}

/**
 * Saves the changed data of the selected contact and shows it in the list.
 */
function saveEditContact() {
    const selectedContact = storedContacts[currentUser];
    selectedContact.name = document.getElementById("dialog_input_name").value.trim();
    selectedContact.email = document.getElementById("dialog_input_email").value.trim();
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
 * Deletes the selected contact and selects the next contact in the list.
 */
function deleteContact() {
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
    if (storedContacts.length > 0) {
        document.getElementById("contact" + currentUser).classList.add("contact-list-selected");
        showContactInformation();
    } else {
        document.getElementById("button_responsive_add_new_contact").classList.remove("d-none");
        document.getElementById("button_responsive_contact_options").classList.add("d-none");
    }
    if (window.innerWidth <= 950) {
        document.querySelector(".section-contacts-information").classList.add("d-none");
        document.querySelector(".section-contacts-information").classList.remove("d-flex");
        document.querySelector(".section-contact-list").classList.remove("d-none");
        document.querySelector(".contact-container-actions-responsive").classList.remove("contact-container-actions-responsive-show");
        document.getElementById("button_responsive_add_new_contact").classList.remove("d-none");
    }
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

/**
 * Opens the contact dialog.
 */
function showDialog() {
    const dialog = document.getElementById("dialog_contact");
    dialog.showModal();
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
 * Resets the inputs, the initials and the buttons of the contact dialog.
 */
function clearDialog() {
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
    document.getElementById("dialog_input_name").removeAttribute("required");
    document.getElementById("dialog_input_email").removeAttribute("required");
    document.getElementById("dialog_input_phone").removeAttribute("required");
}

window.selectContact = selectContact;
window.addNewContact = addNewContact;
window.createContact = createContact;
window.editContact = editContact;
window.saveEditContact = saveEditContact;
window.deleteContact = deleteContact;
window.closeDialog = closeDialog;
window.openContactOptionsResponsive = openContactOptionsResponsive;
window.returnToContactList = returnToContactList;
document.querySelector(".container-dialog-changings").addEventListener("keydown", handleDialogEnterKey);

init();

/**
 * Returns the HTML of a letter heading in the contact list.
 * @param {string} letter - The first letter of the following contacts.
 * @returns {string} The HTML of the letter heading.
 */
function getContactListAlphabetHtmlElement(letter) {
    return `<div class="container-contact-list-alphabet contact-list-container-width">
                        <div class="contact-list-alphabet">${letter}</div>
                    </div>`;
}

/**
 * Returns the HTML of a contact in the contact list.
 * @param {Contact} contact - The contact to show.
 * @param {number} index - The position of the contact in the stored contacts.
 * @returns {string} The HTML of the contact.
 */
function getContactListHtmlElement(contact, index) {
    return `<div class="contact-list-seperator contact-list-container-width"></div>
                    <button id="contact${index}" onclick="selectContact(${index})" class="button-contact contact-list-container-width">
                        <div class="contact-list-initials ${contact.color}">${contact.name.split(" ").map(n => n[0]).join("")}</div>
                        <div class="container-contact-list-info">
                            <div class="contact-list-name">${contact.name}</div>
                            <a>${contact.email}</a>
                        </div>
                    </button>`
}

/**
 * Returns the HTML of the placeholder icon for the initials in the add contact dialog.
 * @returns {string} The HTML of the icon.
 */
function getDialogEmptyInitialsHtmlElement() {
    return `<img class="dialog-initials-create-icon" src="../../assets/icons/create_contact.svg" alt="">`;
}