let storedContacts = [];


/**
 * Reads the cached contacts from the session storage.
 * @returns {Contact[]|null} The cached contacts, or null if nothing is saved or reading fails.
 */
function readSessionContacts() {
  try {
    const savedText = sessionStorage.getItem(contactsKey);
    if (savedText === null) return null;
    return JSON.parse(savedText);
  } catch (error) {
    console.warn('Contacts could not be read:', error);
    return null;
  }
}


/**
 * Loads the contacts from the session storage, or from Firebase if the cache is missing.
 * The cache is removed at every log in, so the contacts are loaded from Firebase once per log in.
 * Shows a message if loading fails.
 * @returns {Promise<void>}
 */
async function loadContacts() {
  const savedContacts = readSessionContacts();
  if (Array.isArray(savedContacts)) {
    storedContacts = savedContacts;
    return;
  }
  try {
    const contactsDbApi = await import('./contactsDbApi.js');
    setStoredContacts(await contactsDbApi.getContacts());
  } catch {
    showToast('Contacts could not be loaded');
  }
}


/**
 * Sets the stored contacts and saves them in the session storage.
 * @param {Contact[]} contacts - The contacts to store.
 */
function setStoredContacts(contacts) {
  storedContacts = contacts;
  try {
    sessionStorage.setItem(contactsKey, JSON.stringify(storedContacts));
  } catch (error) {
    console.warn('Contacts could not be saved:', error);
  }
}


/**
 * Saves a contact in Firebase and refreshes the session storage.
 * A contact without id is created and added to the stored contacts, a contact with id is overwritten.
 * Shows a message if saving fails.
 * @param {Contact} contact - The contact to save.
 * @returns {Promise<boolean>} True if the contact was saved.
 */
async function saveStoredContact(contact) {
  const contactData = JSON.parse(JSON.stringify(contact));
  delete contactData.id;
  try {
    const contactsDbApi = await import('./contactsDbApi.js');
    contact.id = await contactsDbApi.saveContact(contactData, contact.id);
    if (!storedContacts.includes(contact)) storedContacts.push(contact);
    setStoredContacts(storedContacts);
    return true;
  } catch {
    showToast('Contact could not be saved');
    return false;
  }
}


/**
 * Removes a contact from the stored contacts and deletes it in Firebase.
 * Shows a message if deleting in Firebase fails.
 * @param {string} contactId - The id of the contact to delete.
 * @returns {Promise<void>}
 */
async function deleteStoredContact(contactId) {
  setStoredContacts(storedContacts.filter(function (contact) {
    return contact.id !== contactId;
  }));
  try {
    const contactsDbApi = await import('./contactsDbApi.js');
    await contactsDbApi.deleteContact(contactId);
  } catch {
    showToast('Contact could not be deleted');
  }
}
