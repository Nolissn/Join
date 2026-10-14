let tasks = [];

function init() {
}

function render(list) {
}

document.addEventListener('DOMContentLoaded', init);

function togglePasswordVisibility(inputId, toggleButton) {
  const input = document.getElementById(inputId);
  const isHidden = input.type === "password";
  input.type = isHidden ? "text" : "password";
  toggleButton.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
}

function closeDialog(dialogId) {
  const dialog = document.getElementById(dialogId);
    dialog.close();
}