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

const loadingScreenDelay = 1000;
const loadingScreenTimeout = 10000;

async function withLoadingScreen(asyncTask) {
  const loadingScreen = document.getElementById("loadingScreenDialog");
  loadingScreen.showModal();
  const showTimeout = setTimeout(() => loadingScreen.classList.add("loading_screen_dialog_visible"), loadingScreenDelay);
  try {
    return await Promise.race([asyncTask(), rejectAfterTimeout()]);
  } finally {
    clearTimeout(showTimeout);
    loadingScreen.classList.remove("loading_screen_dialog_visible");
    loadingScreen.close();
  }
}

function rejectAfterTimeout() {
  return new Promise((resolve, reject) => {
    setTimeout(() => reject(new Error("Loading took too long")), loadingScreenTimeout);
  });
}
