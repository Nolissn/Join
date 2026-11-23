/**
 * Returns the HTML of a letter heading in the contact list.
 * @param {string} letter - The first letter of the following contacts.
 * @returns {string} The HTML of the letter heading.
 */
function getContactListAlphabetHtmlElement(letter) {
    return `<div class="container-contact-list-alphabet contact-list-container-width">
                        <div class="contact-list-alphabet">${makeTextSafe(letter)}</div>
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
                    <button id="contact${index}" data-index="${index}" class="button-contact contact-list-container-width">
                        <div class="contact-list-initials ${makeTextSafe(contact.color)}">${makeTextSafe(contact.name.split(" ").map(n => n[0]).join(""))}</div>
                        <div class="container-contact-list-info">
                            <div class="contact-list-name">${makeTextSafe(contact.name)}</div>
                            <a>${makeTextSafe(contact.email)}</a>
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
