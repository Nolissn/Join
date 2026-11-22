/**
 * @typedef {Object} Contact
 * @property {string} [id] - The Firestore document id.
 * @property {string} name - The name of the contact.
 * @property {string} email - The email of the contact.
 * @property {string} phone - The phone number of the contact.
 * @property {string} color - The color class of the initials avatar.
 */

/**
 * Creates a sealed contact object.
 * @param {string} name - The name of the contact.
 * @param {string} email - The email of the contact.
 * @param {string} phone - The phone number of the contact.
 * @param {string} color - The color class of the initials avatar.
 * @returns {Contact} The new contact.
 */
export function createContact(name, email, phone, color) {
    return Object.seal({
        name: name,
        email: email,
        phone: phone,
        color: color,
    });
}
