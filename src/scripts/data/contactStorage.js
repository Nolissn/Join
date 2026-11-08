// REMOVE BEFORE LAUNCH
const testContacts = [{
  id: 'testContact1',
  name: 'Timo Weyer',
  email: 'timo.weyer@example.com',
  phone: '+49 123 4567890',
  color: 'red'
}, {
  id: 'testContact2',
  name: 'Anna Müller',
  email: 'anna.mueller@example.com',
  phone: '+49 987 6543210',
  color: 'blue'
}, {
  id: 'testContact3',
  name: 'Max Mustermann',
  email: 'max.mustermann@example.com',
  phone: '+49 555 1234567',
  color: 'purple'
}, {
  id: 'testContact4',
  name: 'Kerstin Weiß',
  email: 'kerstin.weiss@example.com',
  phone: '+49 555 1234567',
  color: 'green'
}, {
  id: 'testContact5',
  name: 'Mila Graf',
  email: 'mila.graf@example.com',
  phone: '+49 555 1234567',
  color: 'darkblue'
}, {
  id: 'testContact6',
  name: 'Thomas Schäfer',
  email: 'thomas.schaefer@example.com',
  phone: '+49 555 1234567',
  color: 'orange'
}, {
  id: 'testContact7',
  name: 'Marcel Petersen',
  email: 'marcel.petersen@example.com',
  phone: '+49 555 1251567',
  color: 'darkgreen'
}];
// <-------------------------------------->
let storedContacts = [];

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

// REMOVE BEFORE LAUNCH
async function loadContacts() {
  const savedContacts = readSessionContacts();
  if (Array.isArray(savedContacts)) {
    storedContacts = savedContacts;
    return;
  }
  setStoredContacts(testContacts);
}
// <-------------------------------------->

/* function look like that, after adding contacts to firebase. please korrect it, if needed.
async function loadContacts() {
  const savedContacts = readSessionContacts();
  if (Array.isArray(savedContacts)) {
    storedContacts = savedContacts;
    return;
  }
  const contactsApi = await import('./joinDbApi.js');
  setStoredContacts(await contactsApi.getContacts());
}
*/

function setStoredContacts(contacts) {
  storedContacts = contacts;
  try {
    sessionStorage.setItem(contactsKey, JSON.stringify(storedContacts));
  } catch (error) {
    console.warn('Contacts could not be saved:', error);
  }
}
