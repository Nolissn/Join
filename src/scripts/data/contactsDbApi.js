import { db } from "./joinDbConfig.js";
import { doc, setDoc, collection, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import { defaultContacts } from "./defaultContacts.js";


/**
 * Returns the Firestore collection that holds the contacts of the logged-in user.
 * @returns {CollectionReference} The contacts collection of the current user.
 * @throws {Error} If no user is logged in.
 */
function getContactsCollection() {
    if (typeof currentUser === "undefined" || currentUser === null) {
        throw new Error("No user is logged in");
    }
    return collection(db, "users", currentUser.id, "contacts");
}


/**
 * Loads all contacts of the logged-in user from Firestore.
 * @returns {Promise<Contact[]>} All contacts including their document id.
 * @throws {Error} If loading fails or no user is logged in.
 */
export async function getContacts() {
    const snap = await getDocs(getContactsCollection());
    return snap.docs.map(function (contactDoc) {
        return { ...contactDoc.data(), id: contactDoc.id };
    });
}


/**
 * Saves a contact in Firestore.
 * Creates a new contact if no id is given, otherwise overwrites the contact with this id.
 * The contact must not contain undefined values, because Firestore does not accept them.
 * @param {Contact} contactModel - The contact data without id.
 * @param {string} [contactId] - The id of the contact to overwrite.
 * @returns {Promise<string>} The id of the saved contact.
 * @throws {Error} If saving fails or no user is logged in.
 */
export async function saveContact(contactModel, contactId) {
    let ref;
    if (contactId) {
        ref = doc(getContactsCollection(), contactId);
    } else {
        ref = doc(getContactsCollection());
    }
    await setDoc(ref, contactModel);
    return ref.id;
}


/**
 * Saves the own contact of a newly registered user, so the user appears in the own contact list.
 * The user is not logged in yet, so the user id is passed instead of using the current user.
 * @param {string} userId - The id of the new user.
 * @param {{name: string, email: string}} user - The name and the email of the new user.
 * @returns {Promise<string|null>} The id of the created contact, or null if saving fails.
 */
export async function saveOwnContact(userId, user) {
    try {
        const ref = doc(collection(db, "users", userId, "contacts"));
        await setDoc(ref, { name: user.name, email: user.email, phone: "", color: "darkblue" });
        return ref.id;
    } catch {
        return null;
    }
}


/**
 * Saves the default demo contacts of a newly registered user, so the user can assign tasks right away.
 * The user is not logged in yet, so the user id is passed instead of using the current user.
 * @param {string} userId - The id of the new user.
 * @returns {Promise<boolean>} True if all default contacts were saved, false if saving fails.
 */
export async function saveDefaultContacts(userId) {
    try {
        const contactsCollection = collection(db, "users", userId, "contacts");
        await Promise.all(defaultContacts.map((contact) => setDoc(doc(contactsCollection), { ...contact })));
        return true;
    } catch {
        return false;
    }
}


/**
 * Deletes a contact in Firestore.
 * @param {string} contactId - The id of the contact to delete.
 * @returns {Promise<void>}
 * @throws {Error} If deleting fails or no user is logged in.
 */
export async function deleteContact(contactId) {
    await deleteDoc(doc(getContactsCollection(), contactId));
}
