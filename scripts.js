let tasks = [];

function init() {
}

function render(list) {
}

document.addEventListener('DOMContentLoaded', init);

function closeDialog(dialogId) {
  const dialog = document.getElementById(dialogId);
    dialog.close();
}

function getSignUpInputValues() {
  return {
    name: document.getElementById("nameSignUp").value,
    email: document.getElementById("emailSignUp").value,
    password: document.getElementById("passwordSignUp").value,
    confirmPassword: document.getElementById("confirmPasswordSignUp").value,
  };
}
