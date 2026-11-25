/**
 * Removes the active state and the priority classes from all priority buttons.
 */
function clearPriorityButtons() {
    document.querySelectorAll(".priority-btn").forEach(button => {
        button.classList.remove("btn-active", "priority-urgent", "priority-medium", "priority-low");
    });
}


/**
 * Selects a priority button, or deselects it if it was already active.
 * Updates the icons and the create task button afterwards.
 * @param {string} priority - "urgent", "medium" or "low".
 */
function setPriority(priority) {
    const buttonId = `priority${priority.charAt(0).toUpperCase()}${priority.slice(1)}`;
    const selectedButton = document.getElementById(buttonId);
    const isActive = selectedButton.classList.contains("btn-active");
    clearPriorityButtons();
    if (!isActive) selectedButton.classList.add("btn-active", `priority-${priority}`);
    updatePriorityIcons();
    updateCreateTaskButton();
}


/**
 * Shows the active or the default icon of a priority button.
 * @param {HTMLElement} button - The priority button.
 */
function updatePriorityIcon(button) {
    const icon = button.querySelector(".priority-btn-icon");
    const activeIcon = button.classList.contains("btn-active") && icon.dataset.activeIcon;
    icon.src = `../../assets/icons/${activeIcon || icon.dataset.icon}`;
}


/**
 * Updates the icons of all priority buttons.
 */
function updatePriorityIcons() {
    document.querySelectorAll(".priority-btn").forEach(updatePriorityIcon);
}


let isSavingTask = false;
const taskSuccessDuration = 3000;

/**
 * Updates the create task button's disabled state and accessibility status.
 */
function updateCreateTaskButton() {
    const createTaskButton = addTaskForm.querySelector(".create-task-btn");
    createTaskButton.disabled = isSavingTask;
    createTaskButton.setAttribute("aria-disabled", String(isSavingTask || !isTaskFormReady()));
}


/**
 * Checks whether the title, the due date, the category and the priority are set.
 * @returns {boolean} Whether the task form is ready to submit.
 */
function isTaskFormReady() {
    const hasTitle = addTaskForm.querySelector("#title").value.trim() !== "";
    const dueDate = addTaskForm.querySelector("#dueDate").value;
    const hasDueDate = dueDate !== "" && !isDueDateInPast(dueDate);
    const hasCategory = addTaskForm.querySelector("#categoryValue").value !== "";
    const hasSelectedPriority = addTaskForm.querySelector(".priority-btn.btn-active") !== null;
    return hasTitle && hasDueDate && hasCategory && hasSelectedPriority;
}


/**
 * Returns the current local date in the format YYYY-MM-DD.
 * @returns {string} The date of today.
 */
function getTodayDateString() {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${today.getFullYear()}-${month}-${day}`;
}


/**
 * Checks whether a due date lies before today.
 * @param {string} dueDate - The due date in the format YYYY-MM-DD.
 * @returns {boolean} True if the due date is set and lies in the past.
 */
function isDueDateInPast(dueDate) {
    return dueDate !== "" && dueDate < getTodayDateString();
}


/**
 * Collects the error of every required field of the add task form.
 * The keys are the ids of the fields, an empty text means the field is valid.
 * @returns {Object<string, string>} The error text of each field.
 */
function getTaskFieldErrors() {
    const dueDate = addTaskForm.querySelector("#dueDate").value;
    return {
        title: addTaskForm.querySelector("#title").value.trim() === "" ? "This field is required" : "",
        dueDate: dueDate === "" ? "This field is required" : isDueDateInPast(dueDate) ? "Date can't be in the past" : "",
        priority: addTaskForm.querySelector(".priority-btn.btn-active") === null ? "Please select a priority" : "",
        category: addTaskForm.querySelector("#categoryValue").value === "" ? "Please select a category" : ""
    };
}


/**
 * Shows the errors of all required fields at once below the fields.
 * @returns {boolean} True if all required fields are valid.
 */
function validateTaskForm() {
    const fieldErrors = getTaskFieldErrors();
    Object.entries(fieldErrors).forEach(([fieldId, errorText]) => showTaskFieldError(fieldId, errorText));
    return Object.values(fieldErrors).every(errorText => errorText === "");
}


/**
 * Shows or removes the error text below a field and marks the field as invalid.
 * @param {string} fieldId - The id of the field.
 * @param {string} errorText - The error text, or an empty string to remove the error.
 */
function showTaskFieldError(fieldId, errorText) {
    addTaskForm.querySelector(`#${fieldId}Error`).textContent = errorText;
    addTaskForm.querySelector(`#${fieldId}`).classList.toggle("add-task-input-invalid", errorText !== "");
}


/**
 * Removes the errors of all fields of the add task form.
 */
function clearTaskFieldErrors() {
    ["title", "dueDate", "priority", "category"].forEach(fieldId => showTaskFieldError(fieldId, ""));
}


/**
 * Removes the error of a field as soon as the user clicks into it or focuses it.
 * @param {HTMLFormElement} form - The add task form.
 */
function registerTaskFieldErrorEvents(form) {
    form.querySelectorAll(".add-task-field-error").forEach(errorElement => {
        const fieldId = errorElement.id.replace("Error", "");
        const container = errorElement.closest(".add-task-input-container");
        container.addEventListener("focusin", () => showTaskFieldError(fieldId, ""));
        container.addEventListener("click", () => showTaskFieldError(fieldId, ""));
    });
}


/**
 * Returns the priority of the active priority button.
 * @returns {string} "urgent", "medium" or "low".
 */
function getSelectedPriority() {
    const selectedButton = addTaskForm.querySelector(".priority-btn.btn-active");
    return selectedButton.id.replace("priority", "").toLowerCase();
}


/**
 * Returns the assigned contact selected in the form.
 * @returns {Object[]} A list with the id and the name of the assigned contact.
 */
function getTaskAssignees() {
    return [...addTaskForm.querySelector("#assignedValue").selectedOptions].map(option => ({
        id: option.value,
        name: option.textContent
    }));
}


/**
 * Fills the assignee select with the contacts already loaded for the current session.
 * @param {HTMLSelectElement} select - The assignee select.
 */
function populateAssignedContacts(select) {
    select.multiple = true;
    select.replaceChildren();
    storedContacts.forEach(contact => {
        select.add(new Option(contact.name, contact.id));
    });
}


/**
 * Builds a new task from the values of the add task form.
 * The status comes from the board column the form was opened from, otherwise it is "todo".
 * @returns {Task} The new task.
 */
function getTaskFromForm() {
    const formData = new FormData(addTaskForm);
    return {
        title: formData.get("title").trim(),
        description: formData.get("description").trim(),
        dueDate: formData.get("dueDate"),
        priority: getSelectedPriority(),
        assignedTo: getTaskAssignees(),
        category: formData.get("category"),
        subtasks: collectTaskSubtasks(),
        status: addTaskForm.dataset.status || "todo",
        createdAt: getTodayDateString()
    };
}


/**
 * Marks the task as saving, hides the status message and disables the create task button.
 * @param {HTMLElement} statusMessage - The status message element.
 */
function startTaskSave(statusMessage) {
    isSavingTask = true;
    statusMessage.hidden = true;
    updateCreateTaskButton();
}


/**
 * Saves the task from the form in Firestore.
 * On the board page, the task is also added to the stored tasks and the board is rendered again.
 * @returns {Promise<void>}
 */
async function persistTask() {
    const { saveTask } = await import("./data/joinDbApi.js");
    const task = getTaskFromForm();
    const taskId = await saveTask(task);
    if (typeof renderBoard === "function") {
        storedTasks.push({ ...task, id: taskId });
        saveTasksToSessionStorage();
        renderBoard();
    }
}


/**
 * Shows a status message below the form.
 * @param {HTMLElement} statusMessage - The status message element.
 * @param {string} state - "success" or "error".
 * @param {string} message - The text to show.
 */
function showTaskStatus(statusMessage, state, message) {
    statusMessage.textContent = message;
    statusMessage.dataset.state = state;
    statusMessage.hidden = false;
}


/**
 * Clears the form and shows the success dialog on the add task page, or the success message in the board dialog.
 * @param {HTMLElement} statusMessage - The status message element.
 */
function handleTaskSaveSuccess(statusMessage) {
    clearTaskForm();
    const successDialog = document.getElementById("taskSuccessDialog");
    if (successDialog) return showTaskSuccessDialog(successDialog);
    showTaskStatus(statusMessage, "success", "Task created successfully.");
}


/**
 * Shows the success dialog and redirects to the board after a short delay.
 * @param {HTMLDialogElement} successDialog - The success dialog of the add task page.
 */
function showTaskSuccessDialog(successDialog) {
    successDialog.showModal();
    setTimeout(() => (location.href = "./board.html"), taskSuccessDuration);
}


/**
 * Shows the error message after saving the task failed.
 * @param {HTMLElement} statusMessage - The status message element.
 */
function handleTaskSaveError(statusMessage) {
    showTaskStatus(statusMessage, "error", "Task could not be saved. Please try again.");
}


/**
 * Ends the saving state and updates the create task button.
 */
function finishTaskSave() {
    isSavingTask = false;
    updateCreateTaskButton();
}


/**
 * Handles the submit of the add task form: validates the form, saves the task and shows the result.
 * @param {SubmitEvent} event - The submit event.
 * @returns {Promise<void>}
 */
async function createTask(event) {
    event.preventDefault();
    const statusMessage = addTaskForm.querySelector("#taskFormStatus");
    if (isSavingTask) return;
    if (!validateTaskForm()) return;
    await saveTaskFromForm(statusMessage);
}


/**
 * Saves the task from the form and shows the result in the status message.
 * @param {HTMLElement} statusMessage - The status message element.
 * @returns {Promise<void>}
 */
async function saveTaskFromForm(statusMessage) {
    startTaskSave(statusMessage);
    try {
        await persistTask();
        handleTaskSaveSuccess(statusMessage);
    } catch {
        handleTaskSaveError(statusMessage);
    } finally {
        finishTaskSave();
    }
}


/**
 * Resets the form, empties the subtask list and selects the medium priority again.
 */
function clearTaskForm() {
    addTaskForm.reset();
    resetSubtasks();
    clearPriorityButtons();
    addTaskForm.querySelector("#priorityMedium").classList.add("btn-active", "priority-medium");
    updatePriorityIcons();
    clearTaskFieldErrors();
    updateCreateTaskButton();
}


let addTaskForm;

/**
 * Registers the priority buttons and the clear button of the add task form.
 * The data-priority attribute of a priority button names its priority.
 * @param {HTMLFormElement} form - The add task form.
 */
function registerAddTaskButtons(form) {
    form.querySelectorAll(".priority-btn").forEach(function (button) {
        button.addEventListener("click", function () {
            setPriority(button.dataset.priority);
        });
    });
    form.querySelector(".clear-task-btn").addEventListener("click", clearTaskForm);
}


/**
 * Initializes the add task form: sets up the custom selects, registers the event listeners and updates the buttons.
 * @param {HTMLFormElement} form - The add task form.
 */
function initializeAddTaskForm(form) {
    addTaskForm = form;
    form.querySelector("#dueDate").min = getTodayDateString();
    populateAssignedContacts(form.querySelector("#assignedValue"));
    form.querySelectorAll(".custom-select").forEach(initializeCustomSelect);
    registerAddTaskButtons(form);
    initializeSubtasks(form);
    registerTaskFieldErrorEvents(form);
    form.addEventListener("submit", createTask);
    form.addEventListener("input", updateCreateTaskButton);
    form.addEventListener("change", updateCreateTaskButton);
    form.addEventListener("reset", scheduleCustomSelectReset);
    updatePriorityIcons();
    updateCreateTaskButton();
}


document.addEventListener("click", handleOutsideCustomSelectClick);
document.addEventListener("focusin", handleOutsideCustomSelectClick);

document.addEventListener("DOMContentLoaded", async function () {
    const form = document.getElementById("addTaskForm");
    if (!form) return;
    await loadContacts();
    initializeAddTaskForm(form);
});
