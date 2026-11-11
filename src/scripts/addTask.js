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

/**
 * Enables the create task button only if the form is valid, all text fields are filled, a priority is selected and no task is being saved.
 */
function updateCreateTaskButton() {
    const createTaskButton = addTaskForm.querySelector(".create-task-btn");
    const hasSelectedPriority = addTaskForm.querySelector(".priority-btn.btn-active") !== null;
    const hasTextContent = [...addTaskForm.querySelectorAll('input[type="text"], textarea')]
        .every(field => field.value.trim().length > 0);
    createTaskButton.disabled = isSavingTask || !addTaskForm.checkValidity() || !hasTextContent || !hasSelectedPriority;
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
 * @param {FormData} formData - The data of the add task form.
 * @returns {Object[]} A list with the id and the name of the assigned contact.
 */
function getTaskAssignees(formData) {
    const assignedOption = addTaskForm.querySelector("#assignedValue").selectedOptions[0];
    return [{ id: formData.get("assigned"), name: assignedOption.textContent }];
}

/**
 * Returns the subtask entered in the form.
 * @param {FormData} formData - The data of the add task form.
 * @returns {Subtask[]} A list with the entered subtask.
 */
function getTaskSubtasks(formData) {
    return [{ title: formData.get("subtasks").trim(), done: false }];
}

/**
 * Builds a new task from the values of the add task form.
 * @returns {Task} The new task with the status "todo".
 */
function getTaskFromForm() {
    const formData = new FormData(addTaskForm);
    return {
        title: formData.get("title").trim(),
        description: formData.get("description").trim(),
        dueDate: formData.get("dueDate"),
        priority: getSelectedPriority(),
        assignedTo: getTaskAssignees(formData),
        category: formData.get("category"),
        subtasks: getTaskSubtasks(formData),
        status: "todo"
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
 * Clears the form and shows the success message.
 * @param {HTMLElement} statusMessage - The status message element.
 */
function handleTaskSaveSuccess(statusMessage) {
    clearTaskForm();
    showTaskStatus(statusMessage, "success", "Task created successfully.");
}

/**
 * Logs the error and shows the error message.
 * @param {HTMLElement} statusMessage - The status message element.
 * @param {Error} error - The error that occurred.
 */
function handleTaskSaveError(statusMessage, error) {
    console.error("Task could not be created:", error);
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
    if (!addTaskForm.reportValidity()) return;
    const statusMessage = addTaskForm.querySelector("#taskFormStatus");
    startTaskSave(statusMessage);
    try {
        await persistTask();
        handleTaskSaveSuccess(statusMessage);
    } catch (error) {
        handleTaskSaveError(statusMessage, error);
    } finally {
        finishTaskSave();
    }
}

/**
 * Resets the form and selects the medium priority again.
 */
function clearTaskForm() {
    addTaskForm.reset();
    clearPriorityButtons();
    addTaskForm.querySelector("#priorityMedium").classList.add("btn-active", "priority-medium");
    updatePriorityIcons();
    updateCreateTaskButton();
}

/**
 * @typedef {Object} CustomSelectContext
 * @property {HTMLElement} container - The custom select container.
 * @property {HTMLSelectElement} select - The hidden native select.
 * @property {HTMLElement} trigger - The button that opens the menu.
 * @property {HTMLElement} menu - The list of options.
 */

/**
 * Closes the menu of a custom select.
 * @param {CustomSelectContext} context - The elements of the custom select.
 */
function closeCustomSelect(context) {
    context.trigger.setAttribute("aria-expanded", "false");
    context.menu.hidden = true;
}

/**
 * Shows the selected option of the hidden select in the trigger and marks it in the menu.
 * @param {CustomSelectContext} context - The elements of the custom select.
 */
function syncCustomSelectSelection(context) {
    const selectedOption = context.select.options[context.select.selectedIndex];
    context.trigger.textContent = selectedOption.textContent;
    context.menu.querySelectorAll('[role="option"]').forEach(option => {
        option.setAttribute("aria-selected", String(option.dataset.value === context.select.value));
    });
}

/**
 * Selects the clicked option, fires a change event, closes the menu and focuses the trigger.
 * @param {CustomSelectContext} context - The elements of the custom select.
 * @param {HTMLElement} option - The clicked menu option.
 */
function handleCustomSelectOptionClick(context, option) {
    context.select.value = option.dataset.value;
    context.select.dispatchEvent(new Event("change", { bubbles: true }));
    closeCustomSelect(context);
    context.trigger.focus();
}

/**
 * Creates a menu option for an option of the hidden select.
 * @param {HTMLOptionElement} option - The option of the select.
 * @param {CustomSelectContext} context - The elements of the custom select.
 * @returns {HTMLElement} The menu option.
 */
function createCustomSelectOption(option, context) {
    const menuOption = document.createElement("div");
    menuOption.className = "custom-select-option";
    menuOption.setAttribute("role", "option");
    menuOption.setAttribute("aria-selected", "false");
    menuOption.tabIndex = -1;
    menuOption.dataset.value = option.value;
    menuOption.textContent = option.textContent;
    menuOption.addEventListener("click", handleCustomSelectOptionClick.bind(null, context, menuOption));
    return menuOption;
}

/**
 * Fills the menu with all visible and enabled options of the select.
 * @param {CustomSelectContext} context - The elements of the custom select.
 */
function populateCustomSelectMenu(context) {
    const options = [...context.select.options].filter(option => !option.hidden && !option.disabled);
    options.forEach(option => context.menu.append(createCustomSelectOption(option, context)));
}

/**
 * Closes all custom selects of the form except the given one.
 * @param {CustomSelectContext} context - The custom select that stays open.
 */
function closeOtherCustomSelects(context) {
    addTaskForm.querySelectorAll(".custom-select").forEach(container => {
        if (container !== context.container) closeCustomSelect(getCustomSelectContext(container));
    });
}

/**
 * Collects the elements of a custom select.
 * @param {HTMLElement} container - The custom select container.
 * @returns {CustomSelectContext} The container, the select, the trigger and the menu.
 */
function getCustomSelectContext(container) {
    return {
        container,
        select: container.querySelector("select"),
        trigger: container.querySelector(".custom-select-trigger"),
        menu: container.querySelector(".custom-select-menu")
    };
}

/**
 * Focuses the selected option, or the first option if none is selected.
 * @param {CustomSelectContext} context - The elements of the custom select.
 */
function focusSelectedCustomOption(context) {
    const selected = context.menu.querySelector('[aria-selected="true"]');
    const firstOption = context.menu.querySelector('[role="option"]');
    (selected || firstOption).focus();
}

/**
 * Opens the menu of a custom select and closes all other menus.
 * @param {CustomSelectContext} context - The elements of the custom select.
 * @param {boolean} [focusSelected=false] - Whether the selected option should be focused.
 */
function openCustomSelect(context, focusSelected = false) {
    closeOtherCustomSelects(context);
    context.menu.hidden = false;
    context.trigger.setAttribute("aria-expanded", "true");
    if (focusSelected) focusSelectedCustomOption(context);
}

/**
 * Opens or closes the menu of a custom select.
 * @param {CustomSelectContext} context - The elements of the custom select.
 */
function toggleCustomSelect(context) {
    if (context.menu.hidden) openCustomSelect(context);
    else closeCustomSelect(context);
}

/**
 * Opens the menu and focuses the selected option when ArrowDown, Enter or Space is pressed on the trigger.
 * @param {CustomSelectContext} context - The elements of the custom select.
 * @param {KeyboardEvent} event - The keydown event.
 */
function handleCustomSelectTriggerKeydown(context, event) {
    if (!["ArrowDown", "Enter", " "].includes(event.key)) return;
    event.preventDefault();
    openCustomSelect(context, true);
}

/**
 * Calculates the index of the option to focus for a navigation key.
 * @param {string} key - The pressed key.
 * @param {HTMLElement[]} options - The menu options.
 * @param {number} currentIndex - The index of the focused option.
 * @returns {number} The new index, or -1 if the key is no navigation key.
 */
function getNextMenuOptionIndex(key, options, currentIndex) {
    if (key === "ArrowDown") return (currentIndex + 1) % options.length;
    if (key === "ArrowUp") return currentIndex <= 0 ? options.length - 1 : currentIndex - 1;
    if (key === "Home") return 0;
    if (key === "End") return options.length - 1;
    return -1;
}

/**
 * Moves the focus to another option when a navigation key is pressed.
 * @param {CustomSelectContext} context - The elements of the custom select.
 * @param {KeyboardEvent} event - The keydown event.
 * @returns {boolean} True if the focus was moved.
 */
function focusNextCustomOption(context, event) {
    const options = [...context.menu.querySelectorAll('[role="option"]')];
    const index = options.indexOf(document.activeElement);
    const nextIndex = getNextMenuOptionIndex(event.key, options, index);
    if (nextIndex === -1) return false;
    event.preventDefault();
    options[nextIndex].focus();
    return true;
}

/**
 * Handles keys in the open menu: navigates, selects with Enter or Space and closes with Escape.
 * @param {CustomSelectContext} context - The elements of the custom select.
 * @param {KeyboardEvent} event - The keydown event.
 */
function handleCustomSelectMenuKeydown(context, event) {
    if (focusNextCustomOption(context, event)) return;
    if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        document.activeElement.click();
    }
    if (event.key === "Escape") {
        closeCustomSelect(context);
        context.trigger.focus();
    }
}

/**
 * Builds the menu of a custom select and registers its event listeners.
 * @param {HTMLElement} container - The custom select container.
 */
function initializeCustomSelect(container) {
    const context = getCustomSelectContext(container);
    populateCustomSelectMenu(context);
    context.trigger.addEventListener("click", () => toggleCustomSelect(context));
    context.trigger.addEventListener("keydown", handleCustomSelectTriggerKeydown.bind(null, context));
    context.menu.addEventListener("keydown", handleCustomSelectMenuKeydown.bind(null, context));
    context.select.addEventListener("change", () => syncCustomSelectSelection(context));
    syncCustomSelectSelection(context);
}

/**
 * Shows the reset values in all custom selects and closes their menus.
 */
function resetCustomSelects() {
    addTaskForm.querySelectorAll(".custom-select").forEach(container => {
        const context = getCustomSelectContext(container);
        syncCustomSelectSelection(context);
        closeCustomSelect(context);
    });
}

/**
 * Resets the custom selects in the next animation frame, after the form reset is done.
 */
function scheduleCustomSelectReset() {
    requestAnimationFrame(resetCustomSelects);
}

let addTaskForm;

/**
 * Initializes the add task form: sets up the custom selects, registers the event listeners and updates the buttons.
 * @param {HTMLFormElement} form - The add task form.
 */
function initializeAddTaskForm(form) {
    addTaskForm = form;
    form.querySelectorAll(".custom-select").forEach(initializeCustomSelect);
    form.addEventListener("submit", createTask);
    form.addEventListener("input", updateCreateTaskButton);
    form.addEventListener("change", updateCreateTaskButton);
    form.addEventListener("reset", scheduleCustomSelectReset);
    updatePriorityIcons();
    updateCreateTaskButton();
}

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("addTaskForm");
    if (form) initializeAddTaskForm(form);
});
