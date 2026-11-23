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
  } catch {
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
  } catch {}
}


/**
 * Saves a contact in Firebase and refreshes the session storage.
 * A contact without id is created and added to the stored contacts.
 * A contact with id is overwritten and its new name is updated in all tasks it is assigned to.
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
    const isNewContact = !storedContacts.includes(contact);
    if (isNewContact) storedContacts.push(contact);
    setStoredContacts(storedContacts);
    if (!isNewContact) await updateContactInTasks(contact);
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


/**
 * Replaces the name of a contact in the assigned contacts of a task.
 * @param {Task} task - The task to check.
 * @param {Contact} contact - The contact with the new name.
 * @returns {boolean} True if the name was changed in the task.
 */
function renameContactInTask(task, contact) {
  if (!Array.isArray(task.assignedTo)) return false;
  let isChanged = false;
  for (const assignee of task.assignedTo) {
    if (assignee.id === contact.id && assignee.name !== contact.name) {
      assignee.name = contact.name;
      isChanged = true;
    }
  }
  return isChanged;
}


/**
 * Updates the name of a contact in all tasks it is assigned to.
 * The changed tasks are marked as outdated, so the board loads them again from Firebase.
 * Shows a message if the tasks could not be updated.
 * @param {Contact} contact - The contact with the new name.
 * @returns {Promise<void>}
 */
async function updateContactInTasks(contact) {
  try {
    const joinDbApi = await import('./joinDbApi.js');
    for (const task of await joinDbApi.getTasks()) {
      if (renameContactInTask(task, contact) === false) continue;
      const taskId = task.id;
      delete task.id;
      await joinDbApi.updateTask(taskId, task);
    }
  } catch {
    showToast('Tasks could not be updated');
  }
}
