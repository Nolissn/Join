let addTaskSubtasks = [];
let editedSubtaskIndex = null;

/**
 * Registers the events of the subtask input and the subtask list and empties the list.
 * @param {HTMLFormElement} form - The add task form.
 */
function initializeSubtasks(form) {
    form.querySelector("#subtasks").addEventListener("keydown", handleSubtaskInputKeydown);
    form.querySelector(".subtask-input-actions").addEventListener("click", handleSubtaskInputAction);
    const list = form.querySelector(".subtask-list");
    list.addEventListener("click", handleSubtaskListClick);
    list.addEventListener("dblclick", handleSubtaskListDoubleClick);
    list.addEventListener("keydown", handleSubtaskEditKeydown);
    resetSubtasks();
}


/**
 * Removes all subtasks, closes the edit mode and renders the empty list.
 */
function resetSubtasks() {
    addTaskSubtasks = [];
    editedSubtaskIndex = null;
    renderSubtaskList();
}


/**
 * Returns the subtask input of the add task form.
 * @returns {HTMLInputElement} The subtask input.
 */
function getSubtaskInput() {
    return addTaskForm.querySelector("#subtasks");
}


/**
 * Adds the entered subtask when Enter is pressed, so the main task is not submitted.
 * @param {KeyboardEvent} event - The keydown event.
 */
function handleSubtaskInputKeydown(event) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    addSubtaskFromInput();
}


/**
 * Handles the clear and add buttons inside the subtask input.
 * @param {MouseEvent} event - The click event.
 */
function handleSubtaskInputAction(event) {
    const button = event.target.closest("[data-subtask-action]");
    if (!button) return;
    if (button.dataset.subtaskAction === "add") addSubtaskFromInput();
    if (button.dataset.subtaskAction === "clear") clearSubtaskInput();
}


/**
 * Moves the entered text into the subtask list and empties the input. Empty text is ignored.
 */
function addPendingSubtask() {
    const input = getSubtaskInput();
    const title = input.value.trim();
    if (title !== "") addTaskSubtasks.push({ title, done: false });
    input.value = "";
}


/**
 * Adds the entered subtask, renders the list, scrolls to the new subtask and keeps the focus in the input for the next subtask.
 */
function addSubtaskFromInput() {
    addPendingSubtask();
    renderSubtaskList();
    const list = addTaskForm.querySelector(".subtask-list");
    list.scrollTop = list.scrollHeight;
    getSubtaskInput().focus();
}


/**
 * Empties the subtask input without adding a subtask.
 */
function clearSubtaskInput() {
    const input = getSubtaskInput();
    input.value = "";
    input.focus();
}


/**
 * Renders the subtask list and focuses the input of the subtask in edit mode.
 */
function renderSubtaskList() {
    const list = addTaskForm.querySelector(".subtask-list");
    list.innerHTML = addTaskSubtasks.map(getSubtaskItemHtml).join("");
    focusEditedSubtask(list);
}


/**
 * Returns the HTML of a subtask, in edit mode if it is the edited subtask.
 * @param {Subtask} subtask - The subtask.
 * @param {number} index - The position of the subtask in the list.
 * @returns {string} The subtask HTML.
 */
function getSubtaskItemHtml(subtask, index) {
    if (index === editedSubtaskIndex) return subtaskEditTemplate(subtask.title, index);
    return subtaskItemTemplate(subtask.title, index);
}


/**
 * Focuses the edit input of the list and places the cursor at the end of the text.
 * @param {HTMLUListElement} list - The subtask list.
 */
function focusEditedSubtask(list) {
    const editInput = list.querySelector(".subtask-edit-input");
    if (!editInput) return;
    editInput.focus();
    editInput.setSelectionRange(editInput.value.length, editInput.value.length);
}


/**
 * Handles the edit, delete and save buttons of the subtask list.
 * @param {MouseEvent} event - The click event.
 */
function handleSubtaskListClick(event) {
    const button = event.target.closest("[data-subtask-action]");
    if (!button) return;
    const index = Number(button.closest(".subtask-item").dataset.index);
    const action = button.dataset.subtaskAction;
    if (action === "edit") startSubtaskEdit(index);
    if (action === "delete") deleteSubtask(index);
    if (action === "save") saveSubtaskEdit();
}


/**
 * Opens the edit mode of a subtask on double click.
 * @param {MouseEvent} event - The dblclick event.
 */
function handleSubtaskListDoubleClick(event) {
    const item = event.target.closest(".subtask-item");
    if (!item || item.classList.contains("subtask-item-editing")) return;
    startSubtaskEdit(Number(item.dataset.index));
}


/**
 * Saves the edited subtask when Enter is pressed, so the main task is not submitted.
 * @param {KeyboardEvent} event - The keydown event.
 */
function handleSubtaskEditKeydown(event) {
    if (event.key !== "Enter" || !event.target.matches(".subtask-edit-input")) return;
    event.preventDefault();
    saveSubtaskEdit();
}


/**
 * Saves a subtask that is still in edit mode and opens the edit mode of another subtask.
 * @param {number} index - The position of the subtask to edit.
 */
function startSubtaskEdit(index) {
    const subtask = addTaskSubtasks[index];
    saveOpenSubtaskEdit();
    const newIndex = addTaskSubtasks.indexOf(subtask);
    editedSubtaskIndex = newIndex === -1 ? null : newIndex;
    renderSubtaskList();
}


/**
 * Takes over the title of the subtask in edit mode. An empty title removes the subtask.
 */
function saveOpenSubtaskEdit() {
    if (editedSubtaskIndex === null) return;
    const title = addTaskForm.querySelector(".subtask-edit-input").value.trim();
    if (title === "") addTaskSubtasks.splice(editedSubtaskIndex, 1);
    else addTaskSubtasks[editedSubtaskIndex].title = title;
    editedSubtaskIndex = null;
}


/**
 * Saves the subtask in edit mode and renders the list.
 */
function saveSubtaskEdit() {
    saveOpenSubtaskEdit();
    renderSubtaskList();
}


/**
 * Deletes a subtask immediately, no matter if it is in edit mode or not.
 * Another subtask that is still in edit mode is saved first.
 * @param {number} index - The position of the subtask to delete.
 */
function deleteSubtask(index) {
    const subtask = addTaskSubtasks[index];
    if (editedSubtaskIndex !== index) saveOpenSubtaskEdit();
    addTaskSubtasks.splice(addTaskSubtasks.indexOf(subtask), 1);
    editedSubtaskIndex = null;
    renderSubtaskList();
}


/**
 * Collects the subtasks for saving the task. An open edit and text left in the input are taken over.
 * @returns {Subtask[]} A copy of the subtasks.
 */
function collectTaskSubtasks() {
    saveOpenSubtaskEdit();
    addPendingSubtask();
    renderSubtaskList();
    return addTaskSubtasks.map(subtask => ({ ...subtask }));
}
