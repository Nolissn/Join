/**
 * Initializes the page after the DOM has loaded: registers the link buttons and the password toggles.
 */
function init() {
  registerLinkButtons();
  registerPasswordToggles();
}

/**
 * Opens the page of the data-href attribute when an element with this attribute is clicked.
 */
function registerLinkButtons() {
  document.querySelectorAll("[data-href]").forEach(function (element) {
    element.addEventListener("click", function () {
      location.href = element.dataset.href;
    });
  });
}

/**
 * Registers the password toggle buttons. The data-input-id attribute names the password input.
 * Pressing the button does not move the focus away from the input.
 */
function registerPasswordToggles() {
  document.querySelectorAll(".auth_card_password_toggle").forEach(function (button) {
    button.addEventListener("mousedown", function (event) {
      event.preventDefault();
    });
    button.addEventListener("click", function () {
      togglePasswordVisibility(button.dataset.inputId, button);
    });
  });
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
