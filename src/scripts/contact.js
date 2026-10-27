const contactURL = "https://join-3236-default-rtdb.europe-west1.firebasedatabase.app/contacts.json";

let contact = [{
    color: "#33FF57",
    email: "jonas.keller@webpost.de",
    name: "Jonas Keller",
    phone: "+49 151 22233344"
},
{
    color: "#3357FF",
    email: "laura.schmidt@netzmail.de",
    name: "Laura Schmidt",
    phone: "+49 160 98765432"
}
]

function init() {
    getContact();
    
}

async function getContact() {
    const response = await fetch(contactURL);
    const data = await response.json();
    console.log(response);
    console.log(data);
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