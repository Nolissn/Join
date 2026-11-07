// import { log } from "firebase/firestore/pipelines";
import { db } from "./data/joinDbConfig.js";
// import { log } from "firebase/firestore/pipelines";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const userColor = ["red", "blue", "green", "darfred", "orange", "purple", "pink", "darkgreen", "turquoise", "darkblue"];

currentUser = 0;

async function init() {
    await loadContacts();
    sortContacts();
    renderContactList();
}

function sortContacts() {
    const sorted = [...storedContacts].sort((a, b) => a.name.localeCompare(b.name, "de"));
    storedContacts = sorted;
}

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

function selectContact(index) {
    document.getElementById("contact" + currentUser).classList.remove("contact-list-selected");
    document.getElementById("contact_initials").classList.remove(storedContacts[currentUser].color);
    currentUser = index;
    document.getElementById("contact" + index).classList.add("contact-list-selected");
    showContactInformation(index);
}

function showContactInformation(index) {
    document.getElementById("contact_information_container").classList.remove("d-none");
    document.getElementById("contact_name").innerText = storedContacts[index].name;
    document.getElementById("contact_email").innerText = storedContacts[index].email;
    document.getElementById("contact_email").href = "mailto:" + storedContacts[index].email;
    document.getElementById("contact_phone").innerText = storedContacts[index].phone;
    document.getElementById("contact_initials").innerText = storedContacts[index].name.split(" ").map(n => n[0]).join("");
    document.getElementById("contact_initials").classList.add("contact-initials", storedContacts[index].color, "add-new-contact");
}

function addNewContact() {
    document.getElementById("dialog_input_name").value = "";
    document.getElementById("dialog_input_email").value = "";
    document.getElementById("dialog_input_phone").value = "";
    document.getElementById("dialog_button_cancel").classList.remove("d-none");
    document.getElementById("dialog_button_create").classList.remove("d-none");
    document.getElementById("dialog_initials").innerHTML = getDialogEmptyInitialsHtmlElement();
    showDialog();
}

function createContact() {
    let randomColor = userColor[Math.floor(Math.random() * userColor.length)];
    if (!document.getElementById("dialog_input_name").value.trim() || !document.getElementById("dialog_input_email").value.trim() || !document.getElementById("dialog_input_phone").value.trim()) {
        checkDialogInputs();
        return;
    } else {
        console.log("step 3");
        storedContacts.push({
            name: document.getElementById("dialog_input_name").value,
            email: document.getElementById("dialog_input_email").value,
            phone: document.getElementById("dialog_input_phone").value,
            color: randomColor
        });
    }
    closeDialog();
    sortContacts();
    renderContactList();
}

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

function editContact() { }
function saveEditContact() { }
function deleteContact() { }
function showDialog() {
    const dialog = document.getElementById("dialog_contact");
    dialog.showModal();
}

function closeDialog() {
    const dialog = document.getElementById("dialog_contact");
    document.getElementById("dialog_button_cancel").classList.add("d-none");
    document.getElementById("dialog_button_create").classList.add("d-none");
    document.getElementById("dialog_button_delete").classList.add("d-none");
    document.getElementById("dialog_button_save").classList.add("d-none");
    dialog.close();
    console.log("Dialog closed");
}

// Module laufen wegen des await in joinDbConfig.js erst nach onload, daher init() hier aufrufen.
window.selectContact = selectContact;
window.addNewContact = addNewContact;
window.createContact = createContact;
window.editContact = editContact;
window.saveEditContact = saveEditContact;
window.deleteContact = deleteContact;
window.closeDialog = closeDialog;

init();

// Hallo, ich habe heute die firebase Datenbank (db) eingerichtet und ich habe dafür eine joinDbConfig.js geschrieben, mit dieser könnt ihr alle arbeiten. Für die die nicht so fit sind mit Datenbanken:
// Die config ist euer Zugang zur db.
// Die Api Datei sind die Funktionen wie push/pull
// Die Modells sind die Struktur der Daten, die in der Datenbank liegen.

// Move to seperate file for contact list HTML elements

function getContactListAlphabetHtmlElement(letter) {
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

function getDialogEmptyInitialsHtmlElement() {
    return `<img class="dialog-initials-create-icon" src="../../assets/icons/create_contact.svg" alt="">`;
}