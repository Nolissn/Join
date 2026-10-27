import { db } from "./data/joinDbConfig.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


function init() {
    getContact();
}

async function getContact() {
    try {
        const snap = await getDocs(collection(db, "contacts"));
        const contacts = snap.docs.map(d => ({ ...d.data(), id: d.id }));
        console.log(contacts);
    } catch (error) {
        console.error("getContact fehlgeschlagen:", error);
    }
}

function showdialog() {
    const dialog = document.getElementById("dialog_contact");
    dialog.showModal();
}

function addNewContact() {
    document.getElementById("dialog-title").innerText = "Add contact";
    document.querySelector(".dialog-slogan").classList.remove("d-none");
    document.querySelector(".dialog-underline").classList.remove("dialog-title-underline");
    showdialog();
}

function editContact() {
    document.getElementById("dialog-title").innerText = "Edit contact";
    document.querySelector(".dialog-slogan").classList.add("d-none");
    document.querySelector(".dialog-underline").classList.add("dialog-title-underline");
    showdialog();
}

function closeDialog() {
    const dialog = document.getElementById("dialog_contact");
    dialog.close();
}

// Module laufen wegen des await in joinDbConfig.js erst nach onload, daher init() hier aufrufen.
window.addNewContact = addNewContact;
window.editContact = editContact;
window.closeDialog = closeDialog;
init();

// Hallo, ich habe heute die firebase Datenbank (db) eingerichtet und ich habe dafür eine joinDbConfig.js geschrieben, mit dieser könnt ihr alle arbeiten. Für die die nicht so fit sind mit Datenbanken: 
// Die config ist euer Zugang zur db.
// Die Api Datei sind die Funktionen wie push/pull
// Die Modells sind die Struktur der Daten, die in der Datenbank liegen.