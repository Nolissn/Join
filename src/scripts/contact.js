import { db } from "./data/joinDbConfig.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

let contact = [{
    name: "Timo Weyer",
    email: "timo.weyer@example.com",
    phone: "+49 123 4567890",
    color: "red"
}, {
    name: "Anna Müller",
    email: "anna.mueller@example.com",
    phone: "+49 987 6543210",
    color: "blue"
}, {
    name: "Max Mustermann",
    email: "max.mustermann@example.com",
    phone: "+49 555 1234567",
    color: "purple"
}, {
    name: "Kerstin Weiß",
    email: "kerstin.weiss@example.com",
    phone: "+49 555 1234567",
    color: "green"
}, {
    name: "Mila Graf",
    email: "mila.graf@example.com",
    phone: "+49 555 1234567",
    color: "darkblue"
}, {
    name: "Thomas Schäfer",
    email: "thomas.schaefer@example.com",
    phone: "+49 555 1234567",
    color: "orange"
}, {
    name: "Marcel Petersen",
    email: "marcel.petersen@example.com",
    phone: "+49 555 1251567",
    color: "darkgreen"
}]

const userColor = ["red", "blue", "green", "darfred", "orange", "purple", "pink", "darkgreen", "turquoise", "darkblue"];

currentUser = 0;

function init() {
    sortContacts();
    renderContactList();
}

function sortContacts() {
    const sorted = [...contact].sort((a, b) => a.name.localeCompare(b.name, "de"));
    contact = sorted;
}

function renderContactList() {
    let currentLetter = "";
    let html = "";
    for (let i = 0; i < contact.length; i++) {
        const letter = contact[i].name[0].toUpperCase();
        if (letter !== currentLetter) {
            currentLetter = letter;
            const alphabet = getContactInitialsHtmlElement(letter);
            html += alphabet;
        }
        html += getContactListHtmlElement(contact[i], i);
    }
    document.getElementById("contact_list").innerHTML = html;
}

function selectContact(contact) {
    document.getElementById("contact_information_container").classList.remove("d-none");
    document.getElementById(`contact${currentUser}`).classList.remove("contact-list-selected");
    currentUser = contact;
    document.getElementById(`contact${contact}`).classList.add("contact-list-selected");
    showContactInformation(currentUser);
}

function showContactInformation(currentUser) {
    const selectedContact = contact[currentUser];
    document.getElementById("contact_initials").innerText = selectedContact.name.split(" ").map(n => n[0]).join("");
    document.getElementById("contact_initials").className = `contact-initials ${selectedContact.color}`;
    document.getElementById("contact_name").innerText = selectedContact.name;
    document.getElementById("contact_email").innerText = selectedContact.email;
    document.getElementById("contact_phone").innerText = selectedContact.phone;
}

function showdialog() {
    const dialog = document.getElementById("dialog_contact");
    dialog.showModal();
}

function addNewContact() {
    document.getElementById("dialog_title").innerText = "Add contact";
    document.querySelector(".dialog-slogan").classList.remove("d-none");
    document.querySelector(".dialog-underline").classList.remove("dialog-title-underline");
    document.getElementById("dialog_button_delete").classList.add("d-none");
    document.getElementById("dialog_button_save").classList.add("d-none");
    document.getElementById("dialog_button_cancel").classList.remove("d-none");
    document.getElementById("dialog_button_create").classList.remove("d-none");
    showdialog();
}

function createContact() {
    const name = document.getElementById("dialog_input_name").value;
    const email = document.getElementById("dialog_input_email").value;
    const phone = document.getElementById("dialog_input_phone").value;
    const color = userColor[Math.floor(Math.random() * userColor.length)];
    contact.push({ name, email, phone, color });
    sortContacts();
    document.getElementById("dialog_input_name").value = "";
    document.getElementById("dialog_input_email").value = "";
    document.getElementById("dialog_input_phone").value = "";
    closeDialog();
    renderContactList();
}

function editContact() {
    document.getElementById("dialog_title").innerText = "Edit contact";
    document.querySelector(".dialog-slogan").classList.add("d-none");
    document.querySelector(".dialog-underline").classList.add("dialog-title-underline");
    document.getElementById("dialog_initials_icon").classList.add("d-none");
    document.getElementById("dialog_button_delete").classList.remove("d-none");
    document.getElementById("dialog_button_save").classList.remove("d-none");
    document.getElementById("dialog_button_cancel").classList.add("d-none");
    document.getElementById("dialog_button_create").classList.add("d-none");
    document.getElementById("dialog_initials").classList.remove("add-new-contact");
    document.getElementById("dialog_initials").classList.add(`${contact[currentUser].color}`);
    document.getElementById("dialog_initials").innerText = contact[currentUser].name.charAt(0);
    const letter = contact[currentUser].name[0].toUpperCase();
    editContactInformation();
    showdialog();
}

function editContactInformation() {
    document.getElementById("dialog_input_name").value = contact[currentUser].name;
    document.getElementById("dialog_input_email").value = contact[currentUser].email;
    document.getElementById("dialog_input_phone").value = contact[currentUser].phone;
}

function closeDialog() {
    const dialog = document.getElementById("dialog_contact");
    dialog.close();
}



function saveEditContact() {
    contact[currentUser].name = document.getElementById("dialog_input_name").value;
    contact[currentUser].email = document.getElementById("dialog_input_email").value;
    contact[currentUser].phone = document.getElementById("dialog_input_phone").value;
    sortContacts();
    closeDialog();
    renderContactList();
    showContactInformation(currentUser);
}

function deleteContact() {
    contact.splice(currentUser, 1);
    closeDialog();
    renderContactList();
}

// Module laufen wegen des await in joinDbConfig.js erst nach onload, daher init() hier aufrufen.
window.selectContact = selectContact;
window.addNewContact = addNewContact;
window.editContact = editContact;
window.closeDialog = closeDialog;
window.createContact = createContact;
window.saveEditContact = saveEditContact;
window.deleteContact = deleteContact;
window.addNewContact = addNewContact;

init();

// Hallo, ich habe heute die firebase Datenbank (db) eingerichtet und ich habe dafür eine joinDbConfig.js geschrieben, mit dieser könnt ihr alle arbeiten. Für die die nicht so fit sind mit Datenbanken:
// Die config ist euer Zugang zur db.
// Die Api Datei sind die Funktionen wie push/pull
// Die Modells sind die Struktur der Daten, die in der Datenbank liegen.

// Move to seperate file for contact list HTML elements

function getContactInitialsHtmlElement(letter) {
    return `<div class="container-contact-list-alphabet contact-list-container-width">
                        <div class="contact-list-alphabet">${letter}</div>
                    </div>`;
}

function getContactListHtmlElement(contact, index) {
    return `<div class="contact-list-seperator contact-list-container-width"></div>
                    <button id="contact${index}" onclick="selectContact(${index})" class="button-contact contact-list-container-width">
                        <div class="contact-list-initials ${contact.color}">${contact.name.split(" ").map(n => n[0]).join("")}</div>
                        <div class="container-contact-list-info">
                            <div class="contact-list-name">${contact.name}</div>
                            <a href="mailto:${contact.email}">${contact.email}</a>
                        </div>
                    </button>`
}