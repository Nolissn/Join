let tasks = [];

/**
 * Initializes the page after the DOM has loaded. Currently empty.
 */
function init() {
}

/**
 * Renders a list. Currently empty.
 * @param {Array} list - The list to render.
 */
function render(list) {
}

document.addEventListener('DOMContentLoaded', init);

/**
 * Shows or hides the password of an input and updates the label of the toggle button.
 * @param {string} inputId - The id of the password input.
 * @param {HTMLElement} toggleButton - The button that toggles the visibility.
 */
function togglePasswordVisibility(inputId, toggleButton) {
  const input = document.getElementById(inputId);
  const isHidden = input.type === "password";
  input.type = isHidden ? "text" : "password";
  toggleButton.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
}

/**
 * Closes the dialog with the given id.
 * @param {string} dialogId - The id of the dialog.
 */
function closeDialog(dialogId) {
  const dialog = document.getElementById(dialogId);
    dialog.close();
}

const loadingScreenDelay = 1000;
const loadingScreenTimeout = 10000;

/**
 * Runs an async task while the loading screen is open.
 * The loading screen becomes visible after a short delay and the task fails if it takes too long.
 * @param {function(): Promise<*>} asyncTask - The task to run.
 * @returns {Promise<*>} The result of the task.
 * @throws {Error} If the task fails or takes longer than the timeout.
 */
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

/**
 * Returns a promise that is rejected after the loading timeout.
 * @returns {Promise<never>} A promise that rejects with an error.
 */
function rejectAfterTimeout() {
  return new Promise((resolve, reject) => {
    setTimeout(() => reject(new Error("Loading took too long")), loadingScreenTimeout);
  });
}
